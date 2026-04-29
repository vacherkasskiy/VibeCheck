using NSubstitute;
using ReviewService.Core.Abstractions.Models.Reviews.UpdateCompanyReview;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Operations.Reviews;
using ReviewService.MessageBroker.Abstractions.Producers;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews;
using ReviewService.PersistentStorage.Abstractions.Repositories.Reviews;

namespace ReviewService.Tests.UnitTests.Operations.Reviews.Command;

public sealed class UpdateCompanyReviewOperationTests
{
    private readonly IReviewsQueryRepository _queryRepository = Substitute.For<IReviewsQueryRepository>();
    private readonly IReviewsCommandRepository _commandRepository = Substitute.For<IReviewsCommandRepository>();
    private readonly IReviewEventsProducer _eventsProducer = Substitute.For<IReviewEventsProducer>();

    [Fact]
    public async Task UpdateAsync_WhenReviewIdIsEmpty_ShouldReturnValidationError()
    {
        var operation = new UpdateCompanyReviewOperation(_queryRepository, _commandRepository, _eventsProducer);

        var model = new UpdateCompanyReviewOperationModel
        {
            ReviewId = Guid.Empty,
            UserId = Guid.NewGuid(),
            Text = "text"
        };

        var result = await operation.UpdateAsync(model, CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("reviewId is required", result.Error.Message);
        Assert.Equal(ErrorType.Validation, result.Error.Type);
    }

    [Fact]
    public async Task UpdateAsync_WhenUserIdIsEmpty_ShouldReturnValidationError()
    {
        var operation = new UpdateCompanyReviewOperation(_queryRepository, _commandRepository, _eventsProducer);

        var model = new UpdateCompanyReviewOperationModel
        {
            ReviewId = Guid.NewGuid(),
            UserId = Guid.Empty,
            Text = "text"
        };

        var result = await operation.UpdateAsync(model, CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("userId is required", result.Error.Message);
    }

    [Fact]
    public async Task UpdateAsync_WhenTextTooLong_ShouldReturnValidationError()
    {
        var operation = new UpdateCompanyReviewOperation(_queryRepository, _commandRepository, _eventsProducer);

        var model = new UpdateCompanyReviewOperationModel
        {
            ReviewId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Text = new string('a', 1001)
        };

        var result = await operation.UpdateAsync(model, CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("text is too long", result.Error.Message);
    }

    [Fact]
    public async Task UpdateAsync_WhenReviewNotFound_ShouldReturnNotFound()
    {
        var operation = new UpdateCompanyReviewOperation(_queryRepository, _commandRepository, _eventsProducer);

        var model = new UpdateCompanyReviewOperationModel
        {
            ReviewId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Text = "text"
        };

        _queryRepository.GetReviewEditInfoAsync(model.ReviewId, Arg.Any<CancellationToken>())
            .Returns((ReviewEditInfoRepositoryModel?)null);

        var result = await operation.UpdateAsync(model, CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("review not found", result.Error.Message);
        Assert.Equal(ErrorType.NotFound, result.Error.Type);
    }

    [Fact]
    public async Task UpdateAsync_WhenReviewDeleted_ShouldReturnValidationError()
    {
        var operation = new UpdateCompanyReviewOperation(_queryRepository, _commandRepository, _eventsProducer);

        var model = new UpdateCompanyReviewOperationModel
        {
            ReviewId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Text = "text"
        };

        _queryRepository.GetReviewEditInfoAsync(model.ReviewId, Arg.Any<CancellationToken>())
            .Returns(new ReviewEditInfoRepositoryModel
            {
                ReviewId = model.ReviewId,
                AuthorId = model.UserId,
                CreatedAtUtc = DateTime.UtcNow,
                IsDeleted = true
            });

        var result = await operation.UpdateAsync(model, CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("review deleted", result.Error.Message);
    }

    [Fact]
    public async Task UpdateAsync_WhenUserIsNotAuthor_ShouldReturnValidationError()
    {
        var operation = new UpdateCompanyReviewOperation(_queryRepository, _commandRepository, _eventsProducer);

        var model = new UpdateCompanyReviewOperationModel
        {
            ReviewId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Text = "text"
        };

        _queryRepository.GetReviewEditInfoAsync(model.ReviewId, Arg.Any<CancellationToken>())
            .Returns(new ReviewEditInfoRepositoryModel
            {
                ReviewId = model.ReviewId,
                AuthorId = Guid.NewGuid(),
                CreatedAtUtc = DateTime.UtcNow,
                IsDeleted = false
            });

        var result = await operation.UpdateAsync(model, CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("policy_forbidden", result.Error.Message);
    }

    [Fact]
    public async Task UpdateAsync_WhenEditWindowExpired_ShouldReturnValidationError()
    {
        var operation = new UpdateCompanyReviewOperation(_queryRepository, _commandRepository, _eventsProducer);

        var model = new UpdateCompanyReviewOperationModel
        {
            ReviewId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Text = "text"
        };

        _queryRepository.GetReviewEditInfoAsync(model.ReviewId, Arg.Any<CancellationToken>())
            .Returns(new ReviewEditInfoRepositoryModel
            {
                ReviewId = model.ReviewId,
                AuthorId = model.UserId,
                CreatedAtUtc = DateTime.UtcNow.AddMinutes(-31),
                IsDeleted = false
            });

        var result = await operation.UpdateAsync(model, CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("edit window expired", result.Error.Message);
    }

    [Fact]
    public async Task UpdateAsync_WhenInputIsValid_ShouldCallRepositoryAndReturnSuccess()
    {
        var operation = new UpdateCompanyReviewOperation(_queryRepository, _commandRepository, _eventsProducer);

        var model = new UpdateCompanyReviewOperationModel
        {
            ReviewId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Text = "updated text"
        };

        _queryRepository.GetReviewEditInfoAsync(model.ReviewId, Arg.Any<CancellationToken>())
            .Returns(new ReviewEditInfoRepositoryModel
            {
                ReviewId = model.ReviewId,
                AuthorId = model.UserId,
                CreatedAtUtc = DateTime.UtcNow.AddMinutes(-29),
                IsDeleted = false
            });

        var result = await operation.UpdateAsync(model, CancellationToken.None);

        Assert.True(result.IsSuccess);

        await _commandRepository.Received(1).UpdateReviewTextAsync(
            model.ReviewId,
            model.Text,
            Arg.Any<DateTime>(),
            Arg.Any<CancellationToken>());

        await _eventsProducer.Received(1).PublishReviewUpdatedAsync(
            model.ReviewId,
            model.UserId,
            Arg.Any<DateTimeOffset>(),
            Arg.Any<CancellationToken>());
    }
}
