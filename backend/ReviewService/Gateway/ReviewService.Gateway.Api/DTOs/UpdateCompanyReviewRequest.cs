using Swashbuckle.AspNetCore.Annotations;

namespace ReviewService.Gateway.Api.DTOs;

public sealed record UpdateCompanyReviewRequest
{
    [SwaggerSchema(Nullable = true)]
    public string? Text { get; init; }
}