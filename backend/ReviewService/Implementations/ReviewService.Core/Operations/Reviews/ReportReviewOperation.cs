using ReviewService.Core.Abstractions.Enums;
using ReviewService.Core.Abstractions.Models.Reviews.ReportReview;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Abstractions.Operations.Reviews;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews;
using ReviewService.PersistentStorage.Abstractions.Repositories.Reviews;

namespace ReviewService.Core.Operations.Reviews;

internal sealed class ReportReviewOperation(
    IReviewsQueryRepository reviewsQueryRepository,
    IReviewsCommandRepository reviewsCommandRepository)
    : IReportReviewOperation
{
    public async Task<Result> ReportAsync(
        ReportReviewOperationModel model,
        CancellationToken ct)
    {
        if (model.ReviewId == Guid.Empty)
            return Error.Validation("reviewId is required");

        if (model.UserId == Guid.Empty)
            return Error.Validation("userId is required");

        var review = await reviewsQueryRepository.GetReviewOwnershipAsync(model.ReviewId, ct);
        if (review is null)
            return Error.NotFound("review not found");

        if (review.IsDeleted)
            return Error.Validation("review deleted");

        if (review.AuthorId == model.UserId)
            return Error.Validation("cannot report own review");

        if (model.ReasonType == ReportReasonTypeOperationEnum.Other &&
            string.IsNullOrWhiteSpace(model.ReasonText))
        {
            return Error.Validation("reasonText is required");
        }

        if (model.ReasonText?.Length > 1000)
            return Error.Validation("reasonText is too long");

        var reasonType = model.ReasonType switch
        {
            ReportReasonTypeOperationEnum.Spam => "spam",
            ReportReasonTypeOperationEnum.Harassment => "harassment",
            ReportReasonTypeOperationEnum.Hate => "hate",
            ReportReasonTypeOperationEnum.Nudity => "nudity",
            ReportReasonTypeOperationEnum.Violence => "violence",
            ReportReasonTypeOperationEnum.Other => "other",
            _ => throw new ArgumentOutOfRangeException(nameof(model.ReasonType))
        };

        var exists = await reviewsQueryRepository.ReportAlreadyExistsAsync(
            model.ReviewId,
            model.UserId,
            reasonType,
            ct);

        if (exists)
            return Error.Conflict("report already exists");

        await reviewsCommandRepository.CreateReportAsync(
            new CreateReviewReportCommandRepositoryModel
            {
                ReportId = Guid.NewGuid(),
                ReviewId = model.ReviewId,
                ReporterId = model.UserId,
                ReasonType = reasonType,
                ReasonText = model.ReasonText,
                CreatedAtUtc = DateTime.UtcNow
            },
            ct);

        return Result.Success();
    }
}