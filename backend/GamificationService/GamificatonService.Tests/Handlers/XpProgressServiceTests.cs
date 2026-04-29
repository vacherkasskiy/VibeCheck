using GamificatonService.Core.Handlers;
using GamificatonService.MessageBroker.Abstractions.Producers;
using GamificatonService.PersistentStorage.Abstractions.Models.AddUserXpTransaction;
using GamificatonService.PersistentStorage.Abstractions.Models.AddXp;
using GamificatonService.PersistentStorage.Abstractions.Models.UserActivity;
using GamificatonService.PersistentStorage.Abstractions.Models.UserXp;
using GamificatonService.PersistentStorage.Abstractions.Models.XpRule;
using GamificatonService.PersistentStorage.Abstractions.Repositories.Command;
using GamificatonService.PersistentStorage.Abstractions.Repositories.Query;
using NSubstitute;

namespace GamificatonService.Tests.Handlers;

public sealed class XpProgressServiceTests
{
    private static readonly Guid ActionRuleId = Guid.Parse("22222222-2222-2222-2222-222222222001");
    private static readonly Guid FirstReviewRuleId = Guid.Parse("22222222-2222-2222-2222-222222222101");
    private static readonly Guid TenReviewsRuleId = Guid.Parse("22222222-2222-2222-2222-222222222102");
    private static readonly Guid FiftyReviewsRuleId = Guid.Parse("22222222-2222-2222-2222-222222222103");
    private static readonly Guid ReviewReactedRuleId = Guid.Parse("22222222-2222-2222-2222-222222222003");
    private static readonly Guid ReviewLikeReceivedRuleId = Guid.Parse("22222222-2222-2222-2222-222222222008");

    [Theory]
    [InlineData(37, new[] { "xp.review.created" })]
    [InlineData(40, new[] { "xp.review.created", "xp.review.created.threshold.10" })]
    [InlineData(50, new[] { "xp.review.created", "xp.review.created.threshold.10", "xp.review.created.threshold.50" })]
    [InlineData(51, new[] { "xp.review.created" })]
    [InlineData(100, new[] { "xp.review.created", "xp.review.created.threshold.10", "xp.review.created.threshold.50" })]
    [InlineData(150, new[] { "xp.review.created", "xp.review.created.threshold.10", "xp.review.created.threshold.50" })]
    public async Task HandleReviewWrittenAsync_AppliesRecurringThresholdRulesOnlyOnMultiples(
        long currentReviewsCount,
        string[] expectedRuleCodes)
    {
        var userId = Guid.NewGuid();
        var eventId = Guid.NewGuid().ToString();
        var reviewId = Guid.NewGuid().ToString();
        var occurredAt = DateTimeOffset.UtcNow;
        var addedTransactions = new List<AddUserXpTransactionRepositoryInputModel>();

        var xpRulesQueryRepository = Substitute.For<IXpRulesQueryRepository>();
        xpRulesQueryRepository
            .GetActiveByActionKeyAsync(
                Arg.Is<GetXpRulesByActionKeyRepositoryInputModel>(x => x.ActionKey == "review.created"),
                Arg.Any<CancellationToken>())
            .Returns(ReviewCreatedRules());

        var xpTransactionsCommandRepository = Substitute.For<IXpTransactionsCommandRepository>();
        xpTransactionsCommandRepository
            .ExistsAsync(Arg.Any<ExistsUserXpTransactionRepositoryInputModel>(), Arg.Any<CancellationToken>())
            .Returns(false);
        xpTransactionsCommandRepository
            .AddAsync(
                Arg.Do<AddUserXpTransactionRepositoryInputModel>(addedTransactions.Add),
                Arg.Any<CancellationToken>())
            .Returns(Task.CompletedTask);

        var levelsCommandRepository = Substitute.For<ILevelsCommandRepository>();
        levelsCommandRepository
            .AddXpAsync(Arg.Any<AddXpRepositoryInputModel>(), Arg.Any<CancellationToken>())
            .Returns(new AddXpRepositoryOutputModel
            {
                NewTotalXp = 100,
                PreviousLevel = 1,
                NewLevel = 1
            });

        var userActivityCountersQueryRepository = Substitute.For<IUserActivityCountersQueryRepository>();
        userActivityCountersQueryRepository
            .GetCountByActionKeyAsync(
                Arg.Is<GetUserActivityCountByActionKeyRepositoryInputModel>(x =>
                    x.UserId == userId && x.ActionKey == "review.created"),
                Arg.Any<CancellationToken>())
            .Returns(currentReviewsCount);

        var userLevelUpEventsProducer = Substitute.For<IUserLevelUpEventsProducer>();
        var service = new XpProgressService(
            xpRulesQueryRepository,
            xpTransactionsCommandRepository,
            levelsCommandRepository,
            userActivityCountersQueryRepository,
            userLevelUpEventsProducer);

        await service.HandleReviewWrittenAsync(
            userId,
            eventId,
            reviewId,
            occurredAt,
            CancellationToken.None);

        Assert.Equal(expectedRuleCodes, addedTransactions.Select(x => RuleCodeById(x.XpRuleId)));
    }

    [Theory]
    [InlineData("like", new[] { "xp.review.reacted", "xp.review.like.received" })]
    [InlineData("dislike", new[] { "xp.review.reacted" })]
    public async Task HandleReviewReactedAsync_AppliesAuthorLikeRulesOnlyForLikes(
        string voteMode,
        string[] expectedRuleCodes)
    {
        var reactedByUserId = Guid.NewGuid();
        var reviewAuthorId = Guid.NewGuid();
        var addedTransactions = new List<AddUserXpTransactionRepositoryInputModel>();

        var xpRulesQueryRepository = Substitute.For<IXpRulesQueryRepository>();
        xpRulesQueryRepository
            .GetActiveByActionKeyAsync(
                Arg.Is<GetXpRulesByActionKeyRepositoryInputModel>(x => x.ActionKey == "review.reacted"),
                Arg.Any<CancellationToken>())
            .Returns([
                Rule(ReviewReactedRuleId, "xp.review.reacted", XpRuleTypeRepositoryEnum.Action, 2, actionKey: "review.reacted")
            ]);
        xpRulesQueryRepository
            .GetActiveByActionKeyAsync(
                Arg.Is<GetXpRulesByActionKeyRepositoryInputModel>(x => x.ActionKey == "review.like.received"),
                Arg.Any<CancellationToken>())
            .Returns([
                Rule(ReviewLikeReceivedRuleId, "xp.review.like.received", XpRuleTypeRepositoryEnum.Action, 3, actionKey: "review.like.received")
            ]);

        var xpTransactionsCommandRepository = Substitute.For<IXpTransactionsCommandRepository>();
        xpTransactionsCommandRepository
            .ExistsAsync(Arg.Any<ExistsUserXpTransactionRepositoryInputModel>(), Arg.Any<CancellationToken>())
            .Returns(false);
        xpTransactionsCommandRepository
            .AddAsync(
                Arg.Do<AddUserXpTransactionRepositoryInputModel>(addedTransactions.Add),
                Arg.Any<CancellationToken>())
            .Returns(Task.CompletedTask);

        var levelsCommandRepository = Substitute.For<ILevelsCommandRepository>();
        levelsCommandRepository
            .AddXpAsync(Arg.Any<AddXpRepositoryInputModel>(), Arg.Any<CancellationToken>())
            .Returns(new AddXpRepositoryOutputModel
            {
                NewTotalXp = 100,
                PreviousLevel = 1,
                NewLevel = 1
            });

        var service = new XpProgressService(
            xpRulesQueryRepository,
            xpTransactionsCommandRepository,
            levelsCommandRepository,
            Substitute.For<IUserActivityCountersQueryRepository>(),
            Substitute.For<IUserLevelUpEventsProducer>());

        await service.HandleReviewReactedAsync(
            reactedByUserId,
            reviewAuthorId,
            voteMode,
            Guid.NewGuid().ToString(),
            Guid.NewGuid().ToString(),
            DateTimeOffset.UtcNow,
            CancellationToken.None);

        Assert.Equal(expectedRuleCodes, addedTransactions.Select(x => RuleCodeById(x.XpRuleId)));
    }

    [Theory]
    [InlineData(1, new[] { "xp.review.created", "xp.review.created.threshold.1" })]
    [InlineData(2, new[] { "xp.review.created" })]
    public async Task HandleReviewWrittenAsync_AppliesFirstReviewThresholdOnlyOnce(
        long currentReviewsCount,
        string[] expectedRuleCodes)
    {
        var userId = Guid.NewGuid();
        var addedTransactions = new List<AddUserXpTransactionRepositoryInputModel>();

        var xpRulesQueryRepository = Substitute.For<IXpRulesQueryRepository>();
        xpRulesQueryRepository
            .GetActiveByActionKeyAsync(Arg.Any<GetXpRulesByActionKeyRepositoryInputModel>(), Arg.Any<CancellationToken>())
            .Returns(ReviewCreatedRules());

        var xpTransactionsCommandRepository = Substitute.For<IXpTransactionsCommandRepository>();
        xpTransactionsCommandRepository
            .ExistsAsync(Arg.Any<ExistsUserXpTransactionRepositoryInputModel>(), Arg.Any<CancellationToken>())
            .Returns(false);
        xpTransactionsCommandRepository
            .AddAsync(
                Arg.Do<AddUserXpTransactionRepositoryInputModel>(addedTransactions.Add),
                Arg.Any<CancellationToken>())
            .Returns(Task.CompletedTask);

        var levelsCommandRepository = Substitute.For<ILevelsCommandRepository>();
        levelsCommandRepository
            .AddXpAsync(Arg.Any<AddXpRepositoryInputModel>(), Arg.Any<CancellationToken>())
            .Returns(new AddXpRepositoryOutputModel
            {
                NewTotalXp = 100,
                PreviousLevel = 1,
                NewLevel = 1
            });

        var userActivityCountersQueryRepository = Substitute.For<IUserActivityCountersQueryRepository>();
        userActivityCountersQueryRepository
            .GetCountByActionKeyAsync(Arg.Any<GetUserActivityCountByActionKeyRepositoryInputModel>(), Arg.Any<CancellationToken>())
            .Returns(currentReviewsCount);

        var service = new XpProgressService(
            xpRulesQueryRepository,
            xpTransactionsCommandRepository,
            levelsCommandRepository,
            userActivityCountersQueryRepository,
            Substitute.For<IUserLevelUpEventsProducer>());

        await service.HandleReviewWrittenAsync(
            userId,
            Guid.NewGuid().ToString(),
            Guid.NewGuid().ToString(),
            DateTimeOffset.UtcNow,
            CancellationToken.None);

        Assert.Equal(expectedRuleCodes, addedTransactions.Select(x => RuleCodeById(x.XpRuleId)));
    }

    private static IReadOnlyCollection<XpRuleRepositoryOutputModel> ReviewCreatedRules()
        =>
        [
            Rule(ActionRuleId, "xp.review.created", XpRuleTypeRepositoryEnum.Action, 30),
            Rule(FirstReviewRuleId, "xp.review.created.threshold.1", XpRuleTypeRepositoryEnum.Threshold, 30, 1),
            Rule(TenReviewsRuleId, "xp.review.created.threshold.10", XpRuleTypeRepositoryEnum.Threshold, 70, 10),
            Rule(FiftyReviewsRuleId, "xp.review.created.threshold.50", XpRuleTypeRepositoryEnum.Threshold, 200, 50)
        ];

    private static XpRuleRepositoryOutputModel Rule(
        Guid id,
        string code,
        XpRuleTypeRepositoryEnum type,
        long xpAmount,
        long? thresholdValue = null,
        string actionKey = "review.created")
        => new()
        {
            Id = id,
            Code = code,
            Name = code,
            Type = type,
            ActionKey = actionKey,
            XpAmount = xpAmount,
            ThresholdValue = thresholdValue,
            IsRepeatable = type == XpRuleTypeRepositoryEnum.Action,
            CooldownDays = null
        };

    private static string RuleCodeById(Guid ruleId)
        => ruleId == ActionRuleId ? "xp.review.created"
            : ruleId == FirstReviewRuleId ? "xp.review.created.threshold.1"
            : ruleId == TenReviewsRuleId ? "xp.review.created.threshold.10"
            : ruleId == FiftyReviewsRuleId ? "xp.review.created.threshold.50"
            : ruleId == ReviewReactedRuleId ? "xp.review.reacted"
            : ruleId == ReviewLikeReceivedRuleId ? "xp.review.like.received"
            : throw new ArgumentOutOfRangeException(nameof(ruleId), ruleId, "Unknown rule id");
}
