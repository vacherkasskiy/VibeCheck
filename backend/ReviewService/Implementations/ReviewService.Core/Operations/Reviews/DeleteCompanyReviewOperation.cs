using ReviewService.Core.Abstractions.Models.Reviews.DeleteCompanyReview;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Abstractions.Operations.Reviews;
using ReviewService.PersistentStorage.Abstractions.Repositories.Reviews;

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
        if (model.ReviewId == Guid.Empty)
            return Error.Validation("reviewId is required");

        if (model.UserId == Guid.Empty)
            return Error.Validation("userId is required");

        var review = await reviewsQueryRepository.GetReviewOwnershipAsync(model.ReviewId, ct);
        if (review is null)
            return Error.NotFound("review not found");

        if (review.IsDeleted)
            return Result.Success();

        if (review.AuthorId != model.UserId)
            return Error.Validation("policy_forbidden");

        await reviewsCommandRepository.SoftDeleteReviewAsync(
            model.ReviewId,
            DateTime.UtcNow,
            ct);

        return Result.Success();
    }
}