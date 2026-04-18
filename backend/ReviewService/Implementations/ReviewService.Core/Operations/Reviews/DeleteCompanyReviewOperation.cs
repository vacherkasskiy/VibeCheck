using ReviewService.Core.Abstractions.Models.Reviews.DeleteCompanyReview;
using ReviewService.Core.Abstractions.Observability;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Abstractions.Operations.Reviews;
using ReviewService.PersistentStorage.Abstractions.Repositories.Reviews;
using System.Diagnostics;

namespace ReviewService.Core.Operations.Reviews;

internal sealed class DeleteCompanyReviewOperation(
    IReviewsQueryRepository reviewsQueryRepository,
    IReviewsCommandRepository reviewsCommandRepository)
    : IDeleteCompanyReviewOperation
{
    public async Task<Result> DeleteAsync(
        DeleteCompanyReviewOperationModel model,
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

            var review = await reviewsQueryRepository.GetReviewOwnershipAsync(model.ReviewId, ct);
            if (review is null)
            {
                status = "not_found";
                return Error.NotFound("review not found");
            }

            if (review.IsDeleted)
                return Result.Success();

            if (review.AuthorId != model.UserId)
            {
                status = "validation";
                return Error.Validation("policy_forbidden");
            }

            await reviewsCommandRepository.SoftDeleteReviewAsync(
                model.ReviewId,
                DateTime.UtcNow,
                ct);

            return Result.Success();
        }
        catch
        {
            status = "exception";
            ReviewMetrics.RecordOperationError("delete_company_review", "core", "exception");
            throw;
        }
        finally
        {
            ReviewMetrics.RecordOperationDuration("delete_company_review", "core", status, stopwatch.Elapsed.TotalMilliseconds);
        }
    }
}
