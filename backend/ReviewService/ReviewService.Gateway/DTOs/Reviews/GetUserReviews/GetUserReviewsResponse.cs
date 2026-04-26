using Swashbuckle.AspNetCore.Annotations;

namespace ReviewService.Gateway.DTOs.Reviews.GetUserReviews;

public sealed record GetUserReviewsResponse
{
    public required long TotalCount { get; init; }
    public required IReadOnlyList<UserReviewItemDto> Reviews { get; init; }
}

public sealed record UserReviewItemDto
{
    public required Guid ReviewId { get; init; }

    // в твоей спеки есть (remove?) — оставил как опциональные, чтобы легко выкинуть
    [SwaggerSchema(Nullable = true)]
    public Guid? AuthorId { get; init; }

    public required string IconId { get; init; }
    
    [SwaggerSchema(Nullable = true)]
    public Guid? CompanyId { get; init; }

    public required string Text { get; init; }
    public required long Score { get; init; }
    public required DateTimeOffset CreatedAt { get; init; }
    public required IReadOnlyList<FlagDto> Flags { get; init; }
}