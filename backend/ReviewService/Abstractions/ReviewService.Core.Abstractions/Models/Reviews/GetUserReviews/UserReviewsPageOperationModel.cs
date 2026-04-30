namespace ReviewService.Core.Abstractions.Models.Reviews.GetUserReviews;

public sealed record UserReviewsPageOperationModel
{
    public required long TotalCount { get; init; }
    public required IReadOnlyList<UserReviewReadOperationModel> Reviews { get; init; }
}

public sealed record UserReviewReadOperationModel
{
    public required Guid ReviewId { get; init; }
    public Guid AuthorId { get; init; }
    public Guid CompanyId { get; init; }
    public string CompanyName { get; init; }

    public required string Text { get; init; }
    public required string AuthorIconId { get; set; }
    public required long Score { get; init; }
    public required DateTimeOffset CreatedAt { get; init; }
    public required IReadOnlyList<FlagOperationModel> Flags { get; init; }
}