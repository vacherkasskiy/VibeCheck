using ReviewService.Core.Abstractions.Enums;

namespace ReviewService.Core.Abstractions.Models.Reviews.ReportReview;

public sealed record ReportReviewOperationModel
{
    public required Guid ReviewId { get; init; }
    public required ReportReasonTypeOperationEnum ReasonTypeOperationEnum { get; init; }
    public string? ReasonText { get; init; }
}