using ReviewService.PersistentStorage.Abstractions.Models.Reviews;
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

    Task<bool> CompanyExistsAsync(
        Guid companyId,
        CancellationToken ct);

    Task<bool> ReviewExistsAsync(
        Guid reviewId,
        CancellationToken ct);

    Task<bool> AllFlagsExistAsync(
        IReadOnlyCollection<Guid> flagIds,
        CancellationToken ct);

    Task<ReviewOwnershipRepositoryModel?> GetReviewOwnershipAsync(
        Guid reviewId,
        CancellationToken ct);

    Task<ReviewOwnershipWithCompanyInfoRepositoryModel?> GetReviewOwnershipWithCompanyInfoAsync(
        Guid reviewId,
        CancellationToken ct);

    Task<ReviewEditInfoRepositoryModel?> GetReviewEditInfoAsync(
        Guid reviewId,
        CancellationToken ct);

    Task<bool> ReportAlreadyExistsAsync(
        Guid reviewId,
        Guid reporterId,
        string reasonType,
        CancellationToken ct);
}