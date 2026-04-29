using GamificatonService.Core.Abstractions.Enums;
using GamificatonService.Core.Handlers;
using GamificatonService.MessageBroker.Abstractions.Producers;
using GamificatonService.PersistentStorage.Abstractions.Models.AchievementProgressUpdate;
using GamificatonService.PersistentStorage.Abstractions.Repositories.Command;
using NSubstitute;

namespace GamificatonService.Tests.Handlers;

public sealed class AchievementProgressServiceTests
{
    [Fact]
    public async Task HandleReviewUpdatedAsync_ShouldIncrementFirstReviewUpdateAchievement()
    {
        var userId = Guid.NewGuid();
        var progressUpdates = new List<AchievementProgressUpdateRepositoryInputModel>();

        var achievementsCommandRepository = CreateAchievementsCommandRepository(progressUpdates);

        var service = new AchievementProgressService(
            achievementsCommandRepository,
            Substitute.For<ILevelsCommandRepository>(),
            Substitute.For<IAchievementEventsProducer>(),
            Substitute.For<IUserLevelUpEventsProducer>());

        await service.HandleReviewUpdatedAsync(userId, CancellationToken.None);

        var update = Assert.Single(progressUpdates);
        Assert.Equal(userId, update.UserId);
        Assert.Equal(AchievementIds.FirstReviewUpdate, update.AchievementId);
        Assert.Equal(1, update.Delta);
        Assert.Equal(1, update.TargetValue);
    }

    [Theory]
    [InlineData("like", true)]
    [InlineData("dislike", false)]
    public async Task HandleReviewReactedAsync_ShouldIncrementAuthorLikeAchievementsOnlyForLikes(
        string voteMode,
        bool shouldIncrementAuthorLikeAchievements)
    {
        var reactedByUserId = Guid.NewGuid();
        var reviewAuthorId = Guid.NewGuid();
        var progressUpdates = new List<AchievementProgressUpdateRepositoryInputModel>();

        var achievementsCommandRepository = CreateAchievementsCommandRepository(progressUpdates);

        var service = new AchievementProgressService(
            achievementsCommandRepository,
            Substitute.For<ILevelsCommandRepository>(),
            Substitute.For<IAchievementEventsProducer>(),
            Substitute.For<IUserLevelUpEventsProducer>());

        await service.HandleReviewReactedAsync(
            reactedByUserId,
            reviewAuthorId,
            voteMode,
            CancellationToken.None);

        Assert.Equal(
            [
                AchievementIds.FirstReactionGiven,
                AchievementIds.TenReactionsGiven,
                AchievementIds.FiftyReactionsGiven,
                AchievementIds.HundredReactionsGiven
            ],
            progressUpdates
                .Where(x => x.UserId == reactedByUserId)
                .Select(x => x.AchievementId));

        var authorLikeAchievementIds = progressUpdates
            .Where(x => x.UserId == reviewAuthorId)
            .Select(x => x.AchievementId)
            .ToArray();

        if (shouldIncrementAuthorLikeAchievements)
        {
            Assert.Equal(
                [
                    AchievementIds.TenLikesReceived,
                    AchievementIds.HundredLikesReceived,
                    AchievementIds.ThousandLikesReceived
                ],
                authorLikeAchievementIds);
        }
        else
        {
            Assert.Empty(authorLikeAchievementIds);
        }
    }

    private static IAchievementsCommandRepository CreateAchievementsCommandRepository(
        List<AchievementProgressUpdateRepositoryInputModel> progressUpdates)
    {
        var achievementsCommandRepository = Substitute.For<IAchievementsCommandRepository>();
        achievementsCommandRepository
            .IncrementProgressAsync(
                Arg.Do<AchievementProgressUpdateRepositoryInputModel>(progressUpdates.Add),
                Arg.Any<CancellationToken>())
            .Returns(callInfo =>
            {
                var input = callInfo.Arg<AchievementProgressUpdateRepositoryInputModel>();

                return new AchievementProgressUpdateRepositoryOutputModel
                {
                    UserId = input.UserId,
                    AchievementId = input.AchievementId,
                    AchievementName = input.AchievementId.ToString(),
                    ProgressCurrent = input.Delta,
                    WasJustObtained = false,
                    AchievementXpReward = 0
                };
            });

        return achievementsCommandRepository;
    }
}
