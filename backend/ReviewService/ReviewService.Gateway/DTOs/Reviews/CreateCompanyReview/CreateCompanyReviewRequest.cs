using Swashbuckle.AspNetCore.Annotations;

namespace ReviewService.Gateway.DTOs.Reviews.CreateCompanyReview;

public sealed record CreateCompanyReviewRequest
{
    /// <summary>текст отзыва (nullable), max 1000.</summary>
    [SwaggerSchema(Nullable = true)]
    public string? Text { get; init; }

    /// <summary>список флагов (обязателен), max 10.</summary>
    [SwaggerSchema(Description = "массив id флагов")]
    public required long[] Flags { get; init; }

    /// <summary>companyId из body (по спецификации), сверяем с route.</summary>
    public required Guid CompanyId { get; init; }
}