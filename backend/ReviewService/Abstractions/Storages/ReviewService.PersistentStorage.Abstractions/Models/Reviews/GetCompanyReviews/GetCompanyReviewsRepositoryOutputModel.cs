using ReviewService.PersistentStorage.Abstractions.Models.Reviews.Shared;

namespace ReviewService.PersistentStorage.Abstractions.Models.Reviews.GetCompanyReviews;

public sealed record GetCompanyReviewsRepositoryOutputModel
{
    public required long TotalCount { get; init; }
    public required IReadOnlyList<CompanyReviewRepositoryItemOutputModel> Reviews { get; init; }
}

public sealed record CompanyReviewRepositoryItemOutputModel
{
    public required double Weight { get; init; }
    public required Guid ReviewId { get; init; }
    public required Guid AuthorId { get; init; }
    public required string IconId { get; init; }
    public required string Text { get; init; }
    public required long Score { get; init; }
    public required DateTimeOffset CreatedAt { get; init; }
    public required IReadOnlyList<FlagRepositoryModel> Flags { get; init; }
}