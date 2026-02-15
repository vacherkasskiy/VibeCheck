namespace ReviewService.Core.Abstractions.Models.Reviews.UpdateCompanyReview;

public sealed record UpdateCompanyReviewOperationModel
{
    public required Guid ReviewId { get; init; } // задаём в контроллере из route
    public required Guid UserId { get; init; }
    public string? Text { get; init; }
}