namespace ReviewService.Core.Abstractions.Models.Reviews.CreateCompanyReview;

public sealed record CreateCompanyReviewOperationModel
{
    public required Guid CompanyId { get; init; }
    public string? Text { get; init; }
    public required long[] Flags { get; init; } // max 10 — валидируй в домене/операции
}