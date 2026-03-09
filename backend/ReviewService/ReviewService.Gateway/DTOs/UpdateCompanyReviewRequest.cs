using Swashbuckle.AspNetCore.Annotations;

namespace ReviewService.Gateway.DTOs;

public sealed record UpdateCompanyReviewRequest
{
    [SwaggerSchema(Nullable = true)]
    public string? Text { get; init; }
}