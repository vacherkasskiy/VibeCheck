using GamificatonService.Core.Abstractions.Handlers;
using GamificatonService.Core.Abstractions.Observability;
using GamificatonService.MessageBroker.Abstractions.Producers;
using GamificatonService.PersistentStorage.Abstractions.Models.AddUserXpTransaction;
using GamificatonService.PersistentStorage.Abstractions.Models.AddXp;
using GamificatonService.PersistentStorage.Abstractions.Models.UserActivity;
using GamificatonService.PersistentStorage.Abstractions.Models.UserXp;
using GamificatonService.PersistentStorage.Abstractions.Models.XpRule;
using GamificatonService.PersistentStorage.Abstractions.Repositories.Command;
using GamificatonService.PersistentStorage.Abstractions.Repositories.Query;

namespace GamificatonService.Core.Handlers;

internal sealed class XpProgressService(
    IXpRulesQueryRepository xpRulesQueryRepository,
    IXpTransactionsCommandRepository xpTransactionsCommandRepository,
    ILevelsCommandRepository levelsCommandRepository,
    IUserActivityCountersQueryRepository userActivityCountersQueryRepository,
    IUserLevelUpEventsProducer userLevelUpEventsProducer)
    : IXpProgressService
{
    public Task HandleReviewWrittenAsync(
        Guid userId,
        string eventId,
        string aggregateId,
        DateTimeOffset occurredAt,
        CancellationToken ct)
        => ProcessAsync(
            userId,
            actionKey: "review.created",
            eventId,
            aggregateId,
            occurredAt,
            currentProgressValueResolver: () => GetCurrentCountAsync(userId, "review.created", ct),
            ct);

    public Task HandleReviewUpdatedAsync(
        Guid userId,
        string eventId,
        string aggregateId,
        DateTimeOffset occurredAt,
        CancellationToken ct)
        => ProcessAsync(
            userId,
            actionKey: "review.updated",
            eventId,
            aggregateId,
            occurredAt,
            currentProgressValueResolver: () => GetCurrentCountAsync(userId, "review.updated", ct),
            ct);

    public async Task HandleReviewReactedAsync(
        Guid reactedByUserId,
        Guid reviewAuthorId,
        string voteMode,
        string eventId,
        string aggregateId,
        DateTimeOffset occurredAt,
        CancellationToken ct)
    {
        await ProcessAsync(
            reactedByUserId,
            actionKey: "review.reacted",
            eventId,
            aggregateId,
            occurredAt,
            currentProgressValueResolver: () => GetCurrentCountAsync(reactedByUserId, "review.reacted", ct),
            ct);

        if (!IsLike(voteMode))
            return;

        await ProcessAsync(
            reviewAuthorId,
            actionKey: "review.like.received",
            eventId,
            aggregateId,
            occurredAt,
            currentProgressValueResolver: () => GetCurrentCountAsync(reviewAuthorId, "review.like.received", ct),
            ct);
    }

    public async Task HandleUserSubscribedAsync(
        Guid subscriberUserId,
        Guid targetUserId,
        string eventId,
        string aggregateId,
        DateTimeOffset occurredAt,
        CancellationToken ct)
    {
        await ProcessAsync(
            subscriberUserId,
            actionKey: "subscription.created.outgoing",
            eventId,
            aggregateId,
            occurredAt,
            currentProgressValueResolver: () => GetCurrentCountAsync(subscriberUserId, "subscription.created.outgoing", ct),
            ct);

        await ProcessAsync(
            targetUserId,
            actionKey: "subscription.created.incoming",
            eventId,
            aggregateId,
            occurredAt,
            currentProgressValueResolver: () => GetCurrentCountAsync(targetUserId, "subscription.created.incoming", ct),
            ct);
    }

    private async Task ProcessAsync(
        Guid userId,
        string actionKey,
        string eventId,
        string aggregateId,
        DateTimeOffset occurredAt,
        Func<Task<long>> currentProgressValueResolver,
        CancellationToken ct)
    {
        var rules = await xpRulesQueryRepository.GetActiveByActionKeyAsync(
            new GetXpRulesByActionKeyRepositoryInputModel
            {
                ActionKey = actionKey
            },
            ct);

        if (rules.Count == 0)
            return;

        foreach (var actionRule in rules.Where(x => x.Type == XpRuleTypeRepositoryEnum.Action))
        {
            await ApplyXpRuleAsync(
                userId,
                actionRule,
                eventId,
                aggregateId,
                occurredAt,
                ct);
        }

        var currentProgressValue = await currentProgressValueResolver();

        foreach (var thresholdRule in rules
                     .Where(x => x.Type == XpRuleTypeRepositoryEnum.Threshold && x.ThresholdValue.HasValue)
                     .OrderBy(x => x.ThresholdValue))
        {
            if (!ShouldApplyThresholdRule(currentProgressValue, thresholdRule.ThresholdValue!.Value))
                continue;

            await ApplyXpRuleAsync(
                userId,
                thresholdRule,
                eventId,
                aggregateId,
                occurredAt,
                ct);
        }
    }

    private static bool ShouldApplyThresholdRule(long currentProgressValue, long thresholdValue)
    {
        if (thresholdValue <= 0 || currentProgressValue < thresholdValue)
            return false;

        return thresholdValue == 1
            ? currentProgressValue == thresholdValue
            : currentProgressValue % thresholdValue == 0;
    }

    private static bool IsLike(string voteMode) =>
        string.IsNullOrWhiteSpace(voteMode) ||
        string.Equals(voteMode, "like", StringComparison.OrdinalIgnoreCase);

    private async Task ApplyXpRuleAsync(
        Guid userId,
        XpRuleRepositoryOutputModel rule,
        string eventId,
        string aggregateId,
        DateTimeOffset occurredAt,
        CancellationToken ct)
    {
        var alreadyApplied = await xpTransactionsCommandRepository.ExistsAsync(
            new ExistsUserXpTransactionRepositoryInputModel
            {
                UserId = userId,
                XpRuleId = rule.Id,
                EventId = eventId
            },
            ct);

        if (alreadyApplied)
            return;

        await xpTransactionsCommandRepository.AddAsync(
            new AddUserXpTransactionRepositoryInputModel
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                XpRuleId = rule.Id,
                XpAmount = rule.XpAmount,
                EventId = eventId,
                AggregateId = aggregateId,
                CreatedAt = occurredAt
            },
            ct);

        GamificationMetrics.RecordXpAwarded(
            rule.XpAmount,
            "xp_rule",
            rule.Code);

        var levelResult = await levelsCommandRepository.AddXpAsync(
            new AddXpRepositoryInputModel
            {
                UserId = userId,
                XpDelta = rule.XpAmount,
                UtcNow = occurredAt
            },
            ct);

        if (levelResult.WasLevelUp)
        {
            GamificationMetrics.RecordLevelUp("xp_rule", rule.Code);

            await userLevelUpEventsProducer.PublishUserLevelUpAsync(
                userId,
                levelResult.NewLevel,
                occurredAt,
                ct);
        }
    }

    private Task<long> GetCurrentCountAsync(
        Guid userId,
        string actionKey,
        CancellationToken ct)
        => userActivityCountersQueryRepository.GetCountByActionKeyAsync(
            new GetUserActivityCountByActionKeyRepositoryInputModel
            {
                UserId = userId,
                ActionKey = actionKey
            },
            ct);
}
