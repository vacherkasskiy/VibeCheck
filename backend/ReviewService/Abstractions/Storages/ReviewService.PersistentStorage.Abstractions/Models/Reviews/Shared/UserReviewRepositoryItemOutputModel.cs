namespace ReviewService.PersistentStorage.Abstractions.Models.Reviews.Shared;

public sealed record UserReviewRepositoryItemOutputModel
{
    public required Guid ReviewId { get; init; }
    public Guid? AuthorId { get; init; }   // (remove?) в спеках
    public Guid? CompanyId { get; init; }  // (remove?) в спеках
    public string? CompanyName { get; init; }  // (remove?) в спеках
    public required string Text { get; init; }
    public required long Score { get; init; }
    public required DateTimeOffset CreatedAt { get; init; }
    public required IReadOnlyList<FlagRepositoryModel> Flags { get; init; }
}