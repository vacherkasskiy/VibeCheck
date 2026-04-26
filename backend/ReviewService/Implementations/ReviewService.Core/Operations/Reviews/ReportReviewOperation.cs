using ReviewService.Core.Abstractions.Enums;
using ReviewService.Core.Abstractions.Models.Reviews.ReportReview;
using ReviewService.Core.Abstractions.Observability;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Abstractions.Operations.Reviews;
using ReviewService.MessageBroker.Abstractions.Producers;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews;
using ReviewService.PersistentStorage.Abstractions.Repositories.Reviews;
using System.Diagnostics;

namespace ReviewService.Core.Operations.Reviews;

internal sealed class ReportReviewOperation(
    IReviewsQueryRepository reviewsQueryRepository,
    IReviewsCommandRepository reviewsCommandRepository,
    IReportEventsProducer reportEventsProducer)
    : IReportReviewOperation
{
    public async Task<Result> ReportAsync(
        ReportReviewOperationModel model,
        CancellationToken ct)
    {
        var stopwatch = Stopwatch.StartNew();
        var status = "success";
        var reasonTypeLabel = "unknown";

        try
        {
            if (model.ReviewId == Guid.Empty)
            {
                status = "validation";
                return Error.Validation("reviewId is required");
            }

            if (model.UserId == Guid.Empty)
            {
                status = "validation";
                return Error.Validation("userId is required");
            }

            var review = await reviewsQueryRepository.GetReviewOwnershipAsync(model.ReviewId, ct);
            if (review is null)
            {
                status = "not_found";
                return Error.NotFound("review not found");
            }

            if (review.IsDeleted)
            {
                status = "validation";
                return Error.Validation("review deleted");
            }

            if (review.AuthorId == model.UserId)
            {
                status = "validation";
                return Error.Validation("cannot report own review");
            }

            if (model.ReasonType == ReportReasonTypeOperationEnum.Other &&
                string.IsNullOrWhiteSpace(model.ReasonText))
            {
                status = "validation";
                return Error.Validation("reasonText is required");
            }

            if (model.ReasonText?.Length > 1000)
            {
                status = "validation";
                return Error.Validation("reasonText is too long");
            }

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

            reasonTypeLabel = reasonType;

            var exists = await reviewsQueryRepository.ReportAlreadyExistsAsync(
                model.ReviewId,
                model.UserId,
                reasonType,
                ct);

            if (exists)
            {
                status = "conflict";
                return Error.Conflict("report already exists");
            }

            var newReport = new CreateReviewReportCommandRepositoryModel
            {
                ReportId = Guid.NewGuid(),
                ReviewId = model.ReviewId,
                ReporterId = model.UserId,
                ReasonType = reasonType,
                ReasonText = model.ReasonText,
                CreatedAtUtc = DateTime.UtcNow
            };

            await reviewsCommandRepository.CreateReportAsync(newReport, ct);

            await reportEventsProducer.PublishReviewReportedAsync(
                newReport.ReportId,
                newReport.ReviewId,
                newReport.ReporterId,
                (int)model.ReasonType,
                newReport.ReasonText,
                newReport.CreatedAtUtc,
                ct);

            ReviewMetrics.RecordReport(reasonTypeLabel, "success");

            return Result.Success();
        }
        catch
        {
            status = "exception";
            ReviewMetrics.RecordOperationError("report_review", "core", "exception");
            throw;
        }
        finally
        {
            ReviewMetrics.RecordOperationDuration("report_review", "core", status, stopwatch.Elapsed.TotalMilliseconds);
        }
    }
}
