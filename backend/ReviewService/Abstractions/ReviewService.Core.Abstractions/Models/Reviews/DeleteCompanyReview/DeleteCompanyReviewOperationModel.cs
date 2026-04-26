namespace ReviewService.Core.Abstractions.Models.Reviews.DeleteCompanyReview;

public sealed record DeleteCompanyReviewOperationModel
{
    public required Guid ReviewId { get; init; }
    public required Guid UserId { get; init; }
}