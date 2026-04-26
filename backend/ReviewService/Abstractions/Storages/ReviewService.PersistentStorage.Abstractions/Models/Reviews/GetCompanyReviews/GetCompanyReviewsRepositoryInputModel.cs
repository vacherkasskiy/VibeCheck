using ReviewService.PersistentStorage.Abstractions.Enums;

namespace ReviewService.PersistentStorage.Abstractions.Models.Reviews.GetCompanyReviews;

public sealed record GetCompanyReviewsRepositoryInputModel
{
    public required Guid CompanyId { get; init; }
    public required int Take { get; init; }
    public required int PageNum { get; init; }
    public required ReviewsSortRepositoryEnum Sort { get; init; }
}