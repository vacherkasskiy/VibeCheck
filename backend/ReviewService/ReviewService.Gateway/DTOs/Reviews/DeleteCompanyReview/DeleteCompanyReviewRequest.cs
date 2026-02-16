namespace ReviewService.Gateway.DTOs.Reviews.DeleteCompanyReview;

public sealed record DeleteCompanyReviewRequest
{
    public required Guid UserId { get; init; }
}