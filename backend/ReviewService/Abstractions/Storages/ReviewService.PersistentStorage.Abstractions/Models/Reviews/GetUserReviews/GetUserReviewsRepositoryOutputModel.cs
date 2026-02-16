using ReviewService.PersistentStorage.Abstractions.Models.Reviews.Shared;

namespace ReviewService.PersistentStorage.Abstractions.Models.Reviews.GetUserReviews;

public sealed record GetUserReviewsRepositoryOutputModel
{
    public required long TotalCount { get; init; }
    public required IReadOnlyList<UserReviewRepositoryItemOutputModel> Reviews { get; init; }
}