using Swashbuckle.AspNetCore.Annotations;

namespace ReviewService.Gateway.DTOs;

public sealed record UpdateCompanyReviewRequest
{
    /// <summary>кто правит (по спецификации).</summary>
    public required Guid UserId { get; init; }

    /// <summary>новый текст (nullable), max 1000.</summary>
    [SwaggerSchema(Nullable = true)]
    public string? Text { get; init; }
}