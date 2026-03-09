using NSubstitute;
using ReviewService.Core.Abstractions.Models.Reviews.DeleteCompanyReview;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Operations.Reviews;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews;
using ReviewService.PersistentStorage.Abstractions.Repositories.Reviews;

namespace ReviewService.Tests.UnitTests.Operations.Reviews.Command;

public sealed class DeleteCompanyReviewOperationTests
{
    private readonly IReviewsQueryRepository _queryRepository = Substitute.For<IReviewsQueryRepository>();
    private readonly IReviewsCommandRepository _commandRepository = Substitute.For<IReviewsCommandRepository>();

    [Fact]
    public async Task DeleteAsync_WhenReviewIdIsEmpty_ShouldReturnValidationError()
    {
        var operation = new DeleteCompanyReviewOperation(_queryRepository, _commandRepository);

        var model = new DeleteCompanyReviewOperationModel
        {
            ReviewId = Guid.Empty,
            UserId = Guid.NewGuid()
        };

        var result = await operation.DeleteAsync(model, CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("reviewId is required", result.Error.Message);
    }

    [Fact]
    public async Task DeleteAsync_WhenUserIdIsEmpty_ShouldReturnValidationError()
    {
        var operation = new DeleteCompanyReviewOperation(_queryRepository, _commandRepository);

        var model = new DeleteCompanyReviewOperationModel
        {
            ReviewId = Guid.NewGuid(),
            UserId = Guid.Empty
        };

        var result = await operation.DeleteAsync(model, CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("userId is required", result.Error.Message);
    }

    [Fact]
    public async Task DeleteAsync_WhenReviewNotFound_ShouldReturnNotFound()
    {
        var operation = new DeleteCompanyReviewOperation(_queryRepository, _commandRepository);

        var model = new DeleteCompanyReviewOperationModel
        {
            ReviewId = Guid.NewGuid(),
            UserId = Guid.NewGuid()
        };

        _queryRepository.GetReviewOwnershipAsync(model.ReviewId, Arg.Any<CancellationToken>())
            .Returns((ReviewOwnershipRepositoryModel?)null);

        var result = await operation.DeleteAsync(model, CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("review not found", result.Error.Message);
        Assert.Equal(ErrorType.NotFound, result.Error.Type);
    }

    [Fact]
    public async Task DeleteAsync_WhenReviewAlreadyDeleted_ShouldReturnSuccess()
    {
        var operation = new DeleteCompanyReviewOperation(_queryRepository, _commandRepository);

        var model = new DeleteCompanyReviewOperationModel
        {
            ReviewId = Guid.NewGuid(),
            UserId = Guid.NewGuid()
        };

        _queryRepository.GetReviewOwnershipAsync(model.ReviewId, Arg.Any<CancellationToken>())
            .Returns(new ReviewOwnershipRepositoryModel
            {
                ReviewId = model.ReviewId,
                AuthorId = model.UserId,
                IsDeleted = true
            });

        var result = await operation.DeleteAsync(model, CancellationToken.None);

        Assert.True(result.IsSuccess);
        await _commandRepository.DidNotReceive().SoftDeleteReviewAsync(Arg.Any<Guid>(), Arg.Any<DateTime>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteAsync_WhenUserIsNotAuthor_ShouldReturnValidationError()
    {
        var operation = new DeleteCompanyReviewOperation(_queryRepository, _commandRepository);

        var model = new DeleteCompanyReviewOperationModel
        {
            ReviewId = Guid.NewGuid(),
            UserId = Guid.NewGuid()
        };

        _queryRepository.GetReviewOwnershipAsync(model.ReviewId, Arg.Any<CancellationToken>())
            .Returns(new ReviewOwnershipRepositoryModel
            {
                ReviewId = model.ReviewId,
                AuthorId = Guid.NewGuid(),
                IsDeleted = false
            });

        var result = await operation.DeleteAsync(model, CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("policy_forbidden", result.Error.Message);
    }

    [Fact]
    public async Task DeleteAsync_WhenInputIsValid_ShouldCallRepositoryAndReturnSuccess()
    {
        var operation = new DeleteCompanyReviewOperation(_queryRepository, _commandRepository);

        var model = new DeleteCompanyReviewOperationModel
        {
            ReviewId = Guid.NewGuid(),
            UserId = Guid.NewGuid()
        };

        _queryRepository.GetReviewOwnershipAsync(model.ReviewId, Arg.Any<CancellationToken>())
            .Returns(new ReviewOwnershipRepositoryModel
            {
                ReviewId = model.ReviewId,
                AuthorId = model.UserId,
                IsDeleted = false
            });

        var result = await operation.DeleteAsync(model, CancellationToken.None);

        Assert.True(result.IsSuccess);

        await _commandRepository.Received(1).SoftDeleteReviewAsync(
            model.ReviewId,
            Arg.Any<DateTime>(),
            Arg.Any<CancellationToken>());
    }
}