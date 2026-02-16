namespace ReviewService.Core.Abstractions.Models.Reviews.GetCompanyReviews;

public sealed record CompanyReviewsPageOperationModel
{
    public required long TotalCount { get; init; }
    public required IReadOnlyList<CompanyReviewOperationModel> Reviews { get; init; }
}

public sealed record CompanyReviewOperationModel
{
    public required double Weight { get; init; }
    public required Guid ReviewId { get; init; }
    public required Guid AuthorId { get; init; }
    public required string IconId { get; init; }
    public required string Text { get; init; }
    public required long Score { get; init; } // likes - dislikes
    public required DateTimeOffset CreatedAt { get; init; }
    public required IReadOnlyList<FlagOperationModel> Flags { get; init; }
}