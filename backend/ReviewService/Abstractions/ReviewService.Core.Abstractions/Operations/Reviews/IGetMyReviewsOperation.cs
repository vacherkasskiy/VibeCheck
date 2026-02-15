using ReviewService.Core.Abstractions.Models;
using ReviewService.Core.Abstractions.Models.Reviews.GetMyReviews;
using ReviewService.Core.Abstractions.Models.Reviews.GetUserReviews;
using ReviewService.Core.Abstractions.Models.Shared;

namespace ReviewService.Core.Abstractions.Operations.Reviews;

public interface IGetMyReviewsOperation
{
    Task<Result<UserReviewsPageOperationModel>> GetAsync(GetMyReviewsOperationModel model, CancellationToken ct);
}