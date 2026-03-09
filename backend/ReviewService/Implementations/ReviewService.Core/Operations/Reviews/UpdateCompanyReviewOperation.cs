using ReviewService.Core.Abstractions.Models.Reviews.UpdateCompanyReview;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Abstractions.Operations.Reviews;
using ReviewService.PersistentStorage.Abstractions.Repositories.Reviews;

namespace ReviewService.Core.Operations.Reviews;

internal sealed class UpdateCompanyReviewOperation(
    IReviewsQueryRepository reviewsQueryRepository,
    IReviewsCommandRepository reviewsCommandRepository)
    : IUpdateCompanyReviewOperation
{
    public async Task<Result> UpdateAsync(
        UpdateCompanyReviewOperationModel model,
        CancellationToken ct)
    {
        if (model.ReviewId == Guid.Empty)
            return Error.Validation("reviewId is required");

        if (model.UserId == Guid.Empty)
            return Error.Validation("userId is required");

        if (model.Text?.Length > 1000)
            return Error.Validation("text is too long");

        var review = await reviewsQueryRepository.GetReviewEditInfoAsync(model.ReviewId, ct);
        if (review is null)
            return Error.NotFound("review not found");

        if (review.IsDeleted)
            return Error.Validation("review deleted");

        if (review.AuthorId != model.UserId)
            return Error.Validation("policy_forbidden");

        if (DateTime.UtcNow - review.CreatedAtUtc > TimeSpan.FromMinutes(5))
            return Error.Validation("edit window expired");

        await reviewsCommandRepository.UpdateReviewTextAsync(
            model.ReviewId,
            model.Text,
            DateTime.UtcNow,
            ct);

        return Result.Success();
    }
}