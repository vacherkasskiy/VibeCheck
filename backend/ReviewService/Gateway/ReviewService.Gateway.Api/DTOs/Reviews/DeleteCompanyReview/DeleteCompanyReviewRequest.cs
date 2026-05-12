namespace ReviewService.Gateway.Api.DTOs.Reviews.DeleteCompanyReview;

public sealed record DeleteCompanyReviewRequest
{
    public required Guid ReviewId { get; init; }
}