using ReviewService.Core.Abstractions.Models.Reviews.GetUserReviews;
using ReviewService.Core.Abstractions.Models.Shared;

namespace ReviewService.Core.Abstractions.Operations.Reviews;

public interface IGetUserReviewsOperation
{
    Task<Result<UserReviewsPageOperationModel>> GetAsync(
        GetUserReviewsOperationModel model,
        CancellationToken ct);
}