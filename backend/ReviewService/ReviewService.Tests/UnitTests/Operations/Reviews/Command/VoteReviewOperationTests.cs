using NSubstitute;
using ReviewService.Core.Abstractions.Enums;
using ReviewService.Core.Abstractions.Models.Reviews;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Operations.Reviews;
using ReviewService.MessageBroker.Abstractions.Producers;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews;
using ReviewService.PersistentStorage.Abstractions.Repositories.Reviews;

namespace ReviewService.Tests.UnitTests.Operations.Reviews.Command;

public sealed class VoteReviewOperationTests
{
    private readonly IReviewsQueryRepository _queryRepository = Substitute.For<IReviewsQueryRepository>();
    private readonly IReviewsCommandRepository _commandRepository = Substitute.For<IReviewsCommandRepository>();
    private readonly IReviewLikesEventsProducer _eventsProducer = Substitute.For<IReviewLikesEventsProducer>();

    [Fact]
    public async Task VoteAsync_WhenReviewIdIsEmpty_ShouldReturnValidationError()
    {
        var operation = new VoteReviewOperation(_queryRepository, _commandRepository, _eventsProducer);

        var model = new VoteReviewOperationModel
        {
            ReviewId = Guid.Empty,
            UserId = Guid.NewGuid(),
            Mode = VoteModeOperationEnum.Like
        };

        var result = await operation.VoteAsync(model, CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("reviewId is required", result.Error.Message);
    }

    [Fact]
    public async Task VoteAsync_WhenUserIdIsEmpty_ShouldReturnValidationError()
    {
        var operation = new VoteReviewOperation(_queryRepository, _commandRepository, _eventsProducer);

        var model = new VoteReviewOperationModel
        {
            ReviewId = Guid.NewGuid(),
            UserId = Guid.Empty,
            Mode = VoteModeOperationEnum.Like
        };

        var result = await operation.VoteAsync(model, CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("userId is required", result.Error.Message);
    }

    [Fact]
    public async Task VoteAsync_WhenReviewNotFound_ShouldReturnNotFound()
    {
        var operation = new VoteReviewOperation(_queryRepository, _commandRepository, _eventsProducer);

        var model = new VoteReviewOperationModel
        {
            ReviewId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Mode = VoteModeOperationEnum.Like
        };

        _queryRepository.GetReviewOwnershipAsync(model.ReviewId, Arg.Any<CancellationToken>())
            .Returns((ReviewOwnershipRepositoryModel?)null);

        var result = await operation.VoteAsync(model, CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("review not found", result.Error.Message);
        Assert.Equal(ErrorType.NotFound, result.Error.Type);
    }

    [Fact]
    public async Task VoteAsync_WhenReviewDeleted_ShouldReturnValidationError()
    {
        var operation = new VoteReviewOperation(_queryRepository, _commandRepository, _eventsProducer);

        var model = new VoteReviewOperationModel
        {
            ReviewId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Mode = VoteModeOperationEnum.Like
        };

        _queryRepository.GetReviewOwnershipAsync(model.ReviewId, Arg.Any<CancellationToken>())
            .Returns(new ReviewOwnershipRepositoryModel
            {
                ReviewId = model.ReviewId,
                AuthorId = Guid.NewGuid(),
                IsDeleted = true
            });

        var result = await operation.VoteAsync(model, CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("review deleted", result.Error.Message);
    }

    [Fact]
    public async Task VoteAsync_WhenUserVotesOwnReview_ShouldReturnValidationError()
    {
        var operation = new VoteReviewOperation(_queryRepository, _commandRepository, _eventsProducer);

        var userId = Guid.NewGuid();
        var model = new VoteReviewOperationModel
        {
            ReviewId = Guid.NewGuid(),
            UserId = userId,
            Mode = VoteModeOperationEnum.Like
        };

        _queryRepository.GetReviewOwnershipAsync(model.ReviewId, Arg.Any<CancellationToken>())
            .Returns(new ReviewOwnershipRepositoryModel
            {
                ReviewId = model.ReviewId,
                AuthorId = userId,
                IsDeleted = false
            });

        var result = await operation.VoteAsync(model, CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("cannot vote own review", result.Error.Message);
    }

    [Fact]
    public async Task VoteAsync_WhenModeIsClear_ShouldDeleteVoteRecalculateAndReturnSuccess()
    {
        var operation = new VoteReviewOperation(_queryRepository, _commandRepository, _eventsProducer);

        var model = new VoteReviewOperationModel
        {
            ReviewId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Mode = VoteModeOperationEnum.Clear
        };

        _queryRepository.GetReviewOwnershipAsync(model.ReviewId, Arg.Any<CancellationToken>())
            .Returns(new ReviewOwnershipRepositoryModel
            {
                ReviewId = model.ReviewId,
                AuthorId = Guid.NewGuid(),
                IsDeleted = false
            });

        var result = await operation.VoteAsync(model, CancellationToken.None);

        Assert.True(result.IsSuccess);

        await _commandRepository.Received(1).DeleteVoteAsync(model.ReviewId, model.UserId, Arg.Any<CancellationToken>());
        await _commandRepository.Received(1).RecalculateReviewScoreAsync(model.ReviewId, Arg.Any<DateTime>(), Arg.Any<CancellationToken>());
        await _commandRepository.DidNotReceive().UpsertVoteAsync(Arg.Any<UpsertReviewVoteCommandRepositoryModel>(), Arg.Any<CancellationToken>());
    }

    [Theory]
    [InlineData(VoteModeOperationEnum.Like, "like")]
    [InlineData(VoteModeOperationEnum.Dislike, "dislike")]
    public async Task VoteAsync_WhenModeIsLikeOrDislike_ShouldUpsertVoteRecalculateAndReturnSuccess(
        VoteModeOperationEnum mode,
        string expectedMode)
    {
        var operation = new VoteReviewOperation(_queryRepository, _commandRepository, _eventsProducer);

        var model = new VoteReviewOperationModel
        {
            ReviewId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Mode = mode
        };

        _queryRepository.GetReviewOwnershipAsync(model.ReviewId, Arg.Any<CancellationToken>())
            .Returns(new ReviewOwnershipRepositoryModel
            {
                ReviewId = model.ReviewId,
                AuthorId = Guid.NewGuid(),
                IsDeleted = false
            });

        var result = await operation.VoteAsync(model, CancellationToken.None);

        Assert.True(result.IsSuccess);

        await _commandRepository.Received(1).UpsertVoteAsync(
            Arg.Is<UpsertReviewVoteCommandRepositoryModel>(x =>
                x.ReviewId == model.ReviewId &&
                x.VoterId == model.UserId &&
                x.Mode == expectedMode),
            Arg.Any<CancellationToken>());

        await _commandRepository.Received(1).RecalculateReviewScoreAsync(model.ReviewId, Arg.Any<DateTime>(), Arg.Any<CancellationToken>());
    }
}