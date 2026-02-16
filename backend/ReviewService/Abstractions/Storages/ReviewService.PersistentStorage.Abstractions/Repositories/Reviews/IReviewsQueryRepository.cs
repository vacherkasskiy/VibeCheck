using ReviewService.PersistentStorage.Abstractions.Models.Reviews.GetCompanyReviews;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews.GetMyReviews;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews.GetUserReviews;

namespace ReviewService.PersistentStorage.Abstractions.Repositories.Reviews;

public interface IReviewsQueryRepository
{
    Task<GetCompanyReviewsRepositoryOutputModel?> GetCompanyReviewsAsync(
        GetCompanyReviewsRepositoryInputModel input,
        CancellationToken ct);

    Task<GetMyReviewsRepositoryOutputModel?> GetMyReviewsAsync(
        GetMyReviewsRepositoryInputModel input,
        CancellationToken ct);

    Task<GetUserReviewsRepositoryOutputModel?> GetUserReviewsAsync(
        GetUserReviewsRepositoryInputModel input,
        CancellationToken ct);
}