namespace ReviewService.Core.Abstractions.Models.Reviews.CreateCompanyReview;

public sealed record CreateCompanyReviewOperationModel
{
    public required Guid UserId { get; init; }
    public required Guid CompanyId { get; init; }
    public string? Text { get; init; }
    public required Guid[] Flags { get; init; }
}