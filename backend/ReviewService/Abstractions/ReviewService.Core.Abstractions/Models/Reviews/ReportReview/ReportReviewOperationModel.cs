using ReviewService.Core.Abstractions.Enums;

namespace ReviewService.Core.Abstractions.Models.Reviews.ReportReview;

public sealed record ReportReviewOperationModel
{
    public required Guid ReviewId { get; init; }
    public required Guid UserId { get; init; }
    public required ReportReasonTypeOperationEnum ReasonType { get; init; }
    public string? ReasonText { get; init; }
}