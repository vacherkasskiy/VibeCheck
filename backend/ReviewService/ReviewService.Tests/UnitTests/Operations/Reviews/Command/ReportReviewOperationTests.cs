using NSubstitute;
using ReviewService.Core.Abstractions.Enums;
using ReviewService.Core.Abstractions.Models.Reviews.ReportReview;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Operations.Reviews;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews;
using ReviewService.PersistentStorage.Abstractions.Repositories.Reviews;

namespace ReviewService.Tests.UnitTests.Operations.Reviews.Command;

public sealed class ReportReviewOperationTests
{
    private readonly IReviewsQueryRepository _queryRepository = Substitute.For<IReviewsQueryRepository>();
    private readonly IReviewsCommandRepository _commandRepository = Substitute.For<IReviewsCommandRepository>();

    [Fact]
    public async Task ReportAsync_WhenReviewIdIsEmpty_ShouldReturnValidationError()
    {
        var operation = new ReportReviewOperation(_queryRepository, _commandRepository);

        var model = new ReportReviewOperationModel
        {
            ReviewId = Guid.Empty,
            UserId = Guid.NewGuid(),
            ReasonType = ReportReasonTypeOperationEnum.Spam
        };

        var result = await operation.ReportAsync(model, CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("reviewId is required", result.Error.Message);
    }

    [Fact]
    public async Task ReportAsync_WhenUserIdIsEmpty_ShouldReturnValidationError()
    {
        var operation = new ReportReviewOperation(_queryRepository, _commandRepository);

        var model = new ReportReviewOperationModel
        {
            ReviewId = Guid.NewGuid(),
            UserId = Guid.Empty,
            ReasonType = ReportReasonTypeOperationEnum.Spam
        };

        var result = await operation.ReportAsync(model, CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("userId is required", result.Error.Message);
    }

    [Fact]
    public async Task ReportAsync_WhenReviewNotFound_ShouldReturnNotFound()
    {
        var operation = new ReportReviewOperation(_queryRepository, _commandRepository);

        var model = new ReportReviewOperationModel
        {
            ReviewId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            ReasonType = ReportReasonTypeOperationEnum.Spam
        };

        _queryRepository.GetReviewOwnershipAsync(model.ReviewId, Arg.Any<CancellationToken>())
            .Returns((ReviewOwnershipRepositoryModel?)null);

        var result = await operation.ReportAsync(model, CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("review not found", result.Error.Message);
        Assert.Equal(ErrorType.NotFound, result.Error.Type);
    }

    [Fact]
    public async Task ReportAsync_WhenReviewDeleted_ShouldReturnValidationError()
    {
        var operation = new ReportReviewOperation(_queryRepository, _commandRepository);

        var model = new ReportReviewOperationModel
        {
            ReviewId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            ReasonType = ReportReasonTypeOperationEnum.Spam
        };

        _queryRepository.GetReviewOwnershipAsync(model.ReviewId, Arg.Any<CancellationToken>())
            .Returns(new ReviewOwnershipRepositoryModel
            {
                ReviewId = model.ReviewId,
                AuthorId = Guid.NewGuid(),
                IsDeleted = true
            });

        var result = await operation.ReportAsync(model, CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("review deleted", result.Error.Message);
    }

    [Fact]
    public async Task ReportAsync_WhenUserReportsOwnReview_ShouldReturnValidationError()
    {
        var operation = new ReportReviewOperation(_queryRepository, _commandRepository);

        var userId = Guid.NewGuid();
        var model = new ReportReviewOperationModel
        {
            ReviewId = Guid.NewGuid(),
            UserId = userId,
            ReasonType = ReportReasonTypeOperationEnum.Spam
        };

        _queryRepository.GetReviewOwnershipAsync(model.ReviewId, Arg.Any<CancellationToken>())
            .Returns(new ReviewOwnershipRepositoryModel
            {
                ReviewId = model.ReviewId,
                AuthorId = userId,
                IsDeleted = false
            });

        var result = await operation.ReportAsync(model, CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("cannot report own review", result.Error.Message);
    }

    [Fact]
    public async Task ReportAsync_WhenReasonTypeIsOtherAndReasonTextMissing_ShouldReturnValidationError()
    {
        var operation = new ReportReviewOperation(_queryRepository, _commandRepository);

        var model = new ReportReviewOperationModel
        {
            ReviewId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            ReasonType = ReportReasonTypeOperationEnum.Other,
            ReasonText = null
        };

        _queryRepository.GetReviewOwnershipAsync(model.ReviewId, Arg.Any<CancellationToken>())
            .Returns(new ReviewOwnershipRepositoryModel
            {
                ReviewId = model.ReviewId,
                AuthorId = Guid.NewGuid(),
                IsDeleted = false
            });

        var result = await operation.ReportAsync(model, CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("reasonText is required", result.Error.Message);
    }

    [Fact]
    public async Task ReportAsync_WhenReasonTextTooLong_ShouldReturnValidationError()
    {
        var operation = new ReportReviewOperation(_queryRepository, _commandRepository);

        var model = new ReportReviewOperationModel
        {
            ReviewId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            ReasonType = ReportReasonTypeOperationEnum.Other,
            ReasonText = new string('a', 1001)
        };

        _queryRepository.GetReviewOwnershipAsync(model.ReviewId, Arg.Any<CancellationToken>())
            .Returns(new ReviewOwnershipRepositoryModel
            {
                ReviewId = model.ReviewId,
                AuthorId = Guid.NewGuid(),
                IsDeleted = false
            });

        var result = await operation.ReportAsync(model, CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("reasonText is too long", result.Error.Message);
    }

    [Fact]
    public async Task ReportAsync_WhenSameReportAlreadyExists_ShouldReturnConflict()
    {
        var operation = new ReportReviewOperation(_queryRepository, _commandRepository);

        var model = new ReportReviewOperationModel
        {
            ReviewId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            ReasonType = ReportReasonTypeOperationEnum.Spam
        };

        _queryRepository.GetReviewOwnershipAsync(model.ReviewId, Arg.Any<CancellationToken>())
            .Returns(new ReviewOwnershipRepositoryModel
            {
                ReviewId = model.ReviewId,
                AuthorId = Guid.NewGuid(),
                IsDeleted = false
            });

        _queryRepository.ReportAlreadyExistsAsync(
                model.ReviewId,
                model.UserId,
                "spam",
                Arg.Any<CancellationToken>())
            .Returns(true);

        var result = await operation.ReportAsync(model, CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("report already exists", result.Error.Message);
        Assert.Equal(ErrorType.Conflict, result.Error.Type);

        await _commandRepository.DidNotReceive().CreateReportAsync(Arg.Any<CreateReviewReportCommandRepositoryModel>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ReportAsync_WhenInputIsValid_ShouldCreateReportAndReturnSuccess()
    {
        var operation = new ReportReviewOperation(_queryRepository, _commandRepository);

        var model = new ReportReviewOperationModel
        {
            ReviewId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            ReasonType = ReportReasonTypeOperationEnum.Harassment,
            ReasonText = "оскорбительная формулировка"
        };

        _queryRepository.GetReviewOwnershipAsync(model.ReviewId, Arg.Any<CancellationToken>())
            .Returns(new ReviewOwnershipRepositoryModel
            {
                ReviewId = model.ReviewId,
                AuthorId = Guid.NewGuid(),
                IsDeleted = false
            });

        _queryRepository.ReportAlreadyExistsAsync(
                model.ReviewId,
                model.UserId,
                "harassment",
                Arg.Any<CancellationToken>())
            .Returns(false);

        var result = await operation.ReportAsync(model, CancellationToken.None);

        Assert.True(result.IsSuccess);

        await _commandRepository.Received(1).CreateReportAsync(
            Arg.Is<CreateReviewReportCommandRepositoryModel>(x =>
                x.ReviewId == model.ReviewId &&
                x.ReporterId == model.UserId &&
                x.ReasonType == "harassment" &&
                x.ReasonText == model.ReasonText),
            Arg.Any<CancellationToken>());
    }
}