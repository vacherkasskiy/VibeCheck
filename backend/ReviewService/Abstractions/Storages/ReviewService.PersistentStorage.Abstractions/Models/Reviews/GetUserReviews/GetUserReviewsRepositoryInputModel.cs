using ReviewService.PersistentStorage.Abstractions.Enums;

namespace ReviewService.PersistentStorage.Abstractions.Models.Reviews.GetUserReviews;

public sealed record GetUserReviewsRepositoryInputModel
{
    public required Guid UserId { get; init; }
    public required int Take { get; init; }
    public required int PageNum { get; init; }
    public required ReviewsSortRepositoryEnum Sort { get; init; }
}