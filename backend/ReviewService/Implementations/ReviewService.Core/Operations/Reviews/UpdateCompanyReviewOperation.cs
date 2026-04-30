using ReviewService.Core.Abstractions.Models.Reviews.UpdateCompanyReview;
using ReviewService.Core.Abstractions.Observability;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Abstractions.Operations.Reviews;
using ReviewService.MessageBroker.Abstractions.Producers;
using ReviewService.PersistentStorage.Abstractions.Repositories.Reviews;
using System.Diagnostics;

namespace ReviewService.Core.Operations.Reviews;

internal sealed class UpdateCompanyReviewOperation(
    IReviewsQueryRepository reviewsQueryRepository,
    IReviewsCommandRepository reviewsCommandRepository,
    IReviewEventsProducer producer)
    : IUpdateCompanyReviewOperation
{
    private static readonly TimeSpan EditWindow = TimeSpan.FromMinutes(30);

    public async Task<Result> UpdateAsync(
        UpdateCompanyReviewOperationModel model,
        CancellationToken ct)
    {
        var stopwatch = Stopwatch.StartNew();
        var status = "success";

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

            if (model.Text?.Length > 1000)
            {
                status = "validation";
                return Error.Validation("text is too long");
            }

            var review = await reviewsQueryRepository.GetReviewEditInfoAsync(model.ReviewId, ct);
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

            if (review.AuthorId != model.UserId)
            {
                status = "validation";
                return Error.Validation("policy_forbidden");
            }

            if (DateTime.UtcNow - review.CreatedAtUtc > EditWindow)
            {
                status = "validation";
                return Error.Validation("edit window expired");
            }

            var updatedAt = DateTime.UtcNow;

            await reviewsCommandRepository.UpdateReviewTextAsync(
                model.ReviewId,
                model.Text,
                updatedAt,
                ct);

            await producer.PublishReviewUpdatedAsync(
                model.ReviewId,
                model.UserId,
                updatedAt,
                ct);

            return Result.Success();
        }
        catch
        {
            status = "exception";
            ReviewMetrics.RecordOperationError("update_company_review", "core", "exception");
            throw;
        }
        finally
        {
            ReviewMetrics.RecordOperationDuration("update_company_review", "core", status, stopwatch.Elapsed.TotalMilliseconds);
        }
    }
}
