using Swashbuckle.AspNetCore.Annotations;

namespace ReviewService.Gateway.DTOs.Reviews.CreateCompanyReview;

public sealed record CreateCompanyReviewRequest
{
    [SwaggerSchema(Nullable = true)]
    public string? Text { get; init; }

    [SwaggerSchema(Description = "массив id флагов")]
    public required Guid[] Flags { get; init; }

    public required Guid CompanyId { get; init; }
}