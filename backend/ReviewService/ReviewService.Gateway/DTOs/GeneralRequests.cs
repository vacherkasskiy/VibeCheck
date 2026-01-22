using Swashbuckle.AspNetCore.Annotations;

namespace ReviewService.Gateway.DTOs;

// -------------------------
// requests
// -------------------------

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

public sealed record UpdateCompanyReviewRequest
{
    /// <summary>кто правит (по спецификации).</summary>
    public required Guid UserId { get; init; }

    /// <summary>новый текст (nullable), max 1000.</summary>
    [SwaggerSchema(Nullable = true)]
    public string? Text { get; init; }
}

public sealed record DeleteCompanyReviewRequest
{
    public required Guid UserId { get; init; }
}

// -------------------------
// responses
// -------------------------

public sealed record GetCompanyReviewsResponse
{
    public required long TotalCount { get; init; }
    public required IReadOnlyList<CompanyReviewItemDto> Reviews { get; init; }
}

public sealed record CompanyReviewItemDto
{
    public required double Weight { get; init; }
    public required Guid ReviewId { get; init; }
    public required Guid AuthorId { get; init; }
    public required string IconId { get; init; }
    public required string Text { get; init; }
    public required long Score { get; init; } // likes - dislikes
    public required DateTimeOffset CreatedAt { get; init; }
    public required IReadOnlyList<FlagDto> Flags { get; init; }
}

// сортировки (пример; под свои enum-значения подгони)
public enum ReviewsSort
{
    Newest = 0,
    Oldest = 1,
    BestScore = 2,
    WorstScore = 3,
    WeightDesc = 4,
    WeightAsc = 5
}