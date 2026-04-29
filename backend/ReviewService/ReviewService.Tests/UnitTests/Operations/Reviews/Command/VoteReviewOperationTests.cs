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

    private static ReviewOwnershipWithCompanyInfoRepositoryModel Review(
        Guid reviewId,
        Guid? authorId = null,
        bool isDeleted = false)
        => new()
        {
            ReviewId = reviewId,
            AuthorId = authorId ?? Guid.NewGuid(),
            CompanyId = Guid.NewGuid(),
            CompanyName = "company",
            IsDeleted = isDeleted
        };

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

        _queryRepository.GetReviewOwnershipWithCompanyInfoAsync(model.ReviewId, Arg.Any<CancellationToken>())
            .Returns((ReviewOwnershipWithCompanyInfoRepositoryModel?)null);

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

        _queryRepository.GetReviewOwnershipWithCompanyInfoAsync(model.ReviewId, Arg.Any<CancellationToken>())
            .Returns(Review(model.ReviewId, isDeleted: true));

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

        _queryRepository.GetReviewOwnershipWithCompanyInfoAsync(model.ReviewId, Arg.Any<CancellationToken>())
            .Returns(Review(model.ReviewId, userId));

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

        _queryRepository.GetReviewOwnershipWithCompanyInfoAsync(model.ReviewId, Arg.Any<CancellationToken>())
            .Returns(Review(model.ReviewId));

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

        _queryRepository.GetReviewOwnershipWithCompanyInfoAsync(model.ReviewId, Arg.Any<CancellationToken>())
            .Returns(Review(model.ReviewId));

        _queryRepository.GetReviewVoteModeAsync(model.ReviewId, model.UserId, Arg.Any<CancellationToken>())
            .Returns((string?)null);

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

    [Theory]
    [InlineData(VoteModeOperationEnum.Like, "like")]
    [InlineData(VoteModeOperationEnum.Dislike, "dislike")]
    public async Task VoteAsync_WhenSameVoteAlreadyExists_ShouldReturnValidationError(
        VoteModeOperationEnum mode,
        string existingMode)
    {
        var operation = new VoteReviewOperation(_queryRepository, _commandRepository, _eventsProducer);

        var model = new VoteReviewOperationModel
        {
            ReviewId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Mode = mode
        };

        _queryRepository.GetReviewOwnershipWithCompanyInfoAsync(model.ReviewId, Arg.Any<CancellationToken>())
            .Returns(Review(model.ReviewId));

        _queryRepository.GetReviewVoteModeAsync(model.ReviewId, model.UserId, Arg.Any<CancellationToken>())
            .Returns(existingMode);

        var result = await operation.VoteAsync(model, CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("review already voted", result.Error.Message);
        Assert.Equal(ErrorType.Validation, result.Error.Type);

        await _commandRepository.DidNotReceive().UpsertVoteAsync(Arg.Any<UpsertReviewVoteCommandRepositoryModel>(), Arg.Any<CancellationToken>());
        await _commandRepository.DidNotReceive().RecalculateReviewScoreAsync(Arg.Any<Guid>(), Arg.Any<DateTime>(), Arg.Any<CancellationToken>());
        await _eventsProducer.DidNotReceive().PublishReviewLikedAsync(
            Arg.Any<Guid>(),
            Arg.Any<Guid>(),
            Arg.Any<Guid>(),
            Arg.Any<Guid>(),
            Arg.Any<string>(),
            Arg.Any<string>(),
            Arg.Any<DateTimeOffset>(),
            Arg.Any<CancellationToken>());
    }

    [Theory]
    [InlineData(VoteModeOperationEnum.Like, "like")]
    [InlineData(VoteModeOperationEnum.Dislike, "dislike")]
    public async Task VoteAsync_WhenVoteIsNew_ShouldPublishReactionEvent(
        VoteModeOperationEnum mode,
        string expectedMode)
    {
        var operation = new VoteReviewOperation(_queryRepository, _commandRepository, _eventsProducer);
        var review = Review(Guid.NewGuid());

        var model = new VoteReviewOperationModel
        {
            ReviewId = review.ReviewId,
            UserId = Guid.NewGuid(),
            Mode = mode
        };

        _queryRepository.GetReviewOwnershipWithCompanyInfoAsync(model.ReviewId, Arg.Any<CancellationToken>())
            .Returns(review);

        _queryRepository.GetReviewVoteModeAsync(model.ReviewId, model.UserId, Arg.Any<CancellationToken>())
            .Returns((string?)null);

        _commandRepository.UpsertVoteAsync(Arg.Any<UpsertReviewVoteCommandRepositoryModel>(), Arg.Any<CancellationToken>())
            .Returns(true);

        var result = await operation.VoteAsync(model, CancellationToken.None);

        Assert.True(result.IsSuccess);

        await _eventsProducer.Received(1).PublishReviewLikedAsync(
            model.UserId,
            model.ReviewId,
            review.AuthorId,
            review.CompanyId,
            review.CompanyName,
            expectedMode,
            Arg.Any<DateTimeOffset>(),
            Arg.Any<CancellationToken>());
    }
}
