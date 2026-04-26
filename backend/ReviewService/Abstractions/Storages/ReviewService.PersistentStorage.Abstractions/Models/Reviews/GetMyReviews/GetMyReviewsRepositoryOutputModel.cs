using ReviewService.PersistentStorage.Abstractions.Models.Reviews.Shared;

namespace ReviewService.PersistentStorage.Abstractions.Models.Reviews.GetMyReviews;

public sealed record GetMyReviewsRepositoryOutputModel
{
    public required long TotalCount { get; init; }
    public required IReadOnlyList<UserReviewRepositoryItemOutputModel> Reviews { get; init; }
}