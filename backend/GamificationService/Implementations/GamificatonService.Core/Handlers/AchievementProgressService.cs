using GamificatonService.Core.Abstractions.Enums;
using GamificatonService.Core.Abstractions.Handlers;
using GamificatonService.Core.Abstractions.Observability;
using GamificatonService.MessageBroker.Abstractions.Producers;
using GamificatonService.PersistentStorage.Abstractions.Models.AchievementProgressUpdate;
using GamificatonService.PersistentStorage.Abstractions.Models.AddXp;
using GamificatonService.PersistentStorage.Abstractions.Repositories.Command;

namespace GamificatonService.Core.Handlers;

internal sealed class AchievementProgressService(
    IAchievementsCommandRepository achievementsCommandRepository,
    ILevelsCommandRepository levelsCommandRepository,
    IAchievementEventsProducer achievementEventsProducer,
    IUserLevelUpEventsProducer userLevelUpEventsProducer)
    : IAchievementProgressService
{
    public async Task HandleReviewWrittenAsync(Guid userId, CancellationToken ct)
    {
        var now = DateTimeOffset.UtcNow;

        await ProcessAchievementAsync(userId, AchievementIds.FirstReview, 1, 1, now, ct);
        await ProcessAchievementAsync(userId, AchievementIds.TenReviews, 1, 10, now, ct);
        await ProcessAchievementAsync(userId, AchievementIds.FiftyReviews, 1, 50, now, ct);
    }

    public async Task HandleReviewUpdatedAsync(Guid userId, CancellationToken ct)
    {
        var now = DateTimeOffset.UtcNow;

        await ProcessAchievementAsync(userId, AchievementIds.FirstReviewUpdate, 1, 1, now, ct);
    }

    public async Task HandleReviewReactedAsync(
        Guid reactedByUserId,
        Guid reviewAuthorId,
        string voteMode,
        CancellationToken ct)
    {
        var now = DateTimeOffset.UtcNow;

        // поставившему оценку
        await ProcessAchievementAsync(reactedByUserId, AchievementIds.FirstReactionGiven, 1, 1, now, ct);
        await ProcessAchievementAsync(reactedByUserId, AchievementIds.TenReactionsGiven, 1, 10, now, ct);
        await ProcessAchievementAsync(reactedByUserId, AchievementIds.FiftyReactionsGiven, 1, 50, now, ct);
        await ProcessAchievementAsync(reactedByUserId, AchievementIds.HundredReactionsGiven, 1, 100, now, ct);

        if (!IsLike(voteMode))
            return;

        // автору отзыва
        await ProcessAchievementAsync(reviewAuthorId, AchievementIds.TenLikesReceived, 1, 10, now, ct);
        await ProcessAchievementAsync(reviewAuthorId, AchievementIds.HundredLikesReceived, 1, 100, now, ct);
        await ProcessAchievementAsync(reviewAuthorId, AchievementIds.ThousandLikesReceived, 1, 1000, now, ct);
    }

    public async Task HandleUserSubscribedAsync(Guid subscriberUserId, Guid targetUserId, CancellationToken ct)
    {
        var now = DateTimeOffset.UtcNow;

        // подписавшемуся
        await ProcessAchievementAsync(subscriberUserId, AchievementIds.FirstSubscriptionMade, 1, 1, now, ct);
        await ProcessAchievementAsync(subscriberUserId, AchievementIds.TenSubscriptionsMade, 1, 10, now, ct);
        await ProcessAchievementAsync(subscriberUserId, AchievementIds.FiftySubscriptionsMade, 1, 50, now, ct);

        // пользователю, на которого подписались
        await ProcessAchievementAsync(targetUserId, AchievementIds.FirstFollowerReceived, 1, 1, now, ct);
        await ProcessAchievementAsync(targetUserId, AchievementIds.TenFollowersReceived, 1, 10, now, ct);
        await ProcessAchievementAsync(targetUserId, AchievementIds.HundredFollowersReceived, 1, 100, now, ct);
    }

    public Task HandleReviewReportedAsync(Guid userId, CancellationToken ct)
    {
        // пока нет ачивок за жалобы
        return Task.CompletedTask;
    }

    private static bool IsLike(string voteMode) =>
        string.IsNullOrWhiteSpace(voteMode) ||
        string.Equals(voteMode, "like", StringComparison.OrdinalIgnoreCase);

    private async Task ProcessAchievementAsync(
        Guid userId,
        Guid achievementId,
        long delta,
        long targetValue,
        DateTimeOffset utcNow,
        CancellationToken ct)
    {
        var result = await achievementsCommandRepository.IncrementProgressAsync(
            new AchievementProgressUpdateRepositoryInputModel
            {
                UserId = userId,
                AchievementId = achievementId,
                Delta = delta,
                TargetValue = targetValue,
                UtcNow = utcNow
            },
            ct);

        if (!result.WasJustObtained)
            return;

        GamificationMetrics.RecordAchievementGranted(result.AchievementName);

        await achievementEventsProducer.PublishAchievementGrantedAsync(
            userId,
            result.AchievementName,
            utcNow,
            ct);

        if (result.AchievementXpReward > 0)
        {
            GamificationMetrics.RecordXpAwarded(
                result.AchievementXpReward,
                "achievement",
                result.AchievementName);

            var levelResult = await levelsCommandRepository.AddXpAsync(
                new AddXpRepositoryInputModel
                {
                    UserId = userId,
                    XpDelta = result.AchievementXpReward,
                    UtcNow = utcNow
                },
                ct);

            if (levelResult.WasLevelUp)
            {
                GamificationMetrics.RecordLevelUp("achievement", result.AchievementName);

                await userLevelUpEventsProducer.PublishUserLevelUpAsync(
                    userId,
                    levelResult.NewLevel,
                    utcNow,
                    ct);
            }
        }
    }
}
