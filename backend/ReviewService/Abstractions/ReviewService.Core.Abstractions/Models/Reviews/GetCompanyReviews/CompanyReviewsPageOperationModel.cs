namespace ReviewService.Core.Abstractions.Models.Reviews.GetCompanyReviews;

public sealed record CompanyReviewsPageOperationModel
{
    public required long TotalCount { get; init; }
    public required IReadOnlyList<CompanyReviewReadModel> Reviews { get; init; }
}

public sealed record CompanyReviewReadModel
{
    public required double Weight { get; init; }
    public required Guid ReviewId { get; init; }
    public required Guid AuthorId { get; init; }
    public required string IconId { get; init; }
    public required string Text { get; init; }
    public required long Score { get; init; } // likes - dislikes
    public required DateTimeOffset CreatedAt { get; init; }
    public required IReadOnlyList<FlagReadOperationModel> Flags { get; init; }
}