using ReviewService.PersistentStorage.Abstractions.Enums;

namespace ReviewService.PersistentStorage.Abstractions.Models.Reviews.GetMyReviews;

public sealed record GetMyReviewsRepositoryInputModel
{
    public required Guid CurrentUserId { get; init; }
    public required int Take { get; init; }
    public required int PageNum { get; init; }
    public required ReviewsSortRepositoryEnum Sort { get; init; }
}