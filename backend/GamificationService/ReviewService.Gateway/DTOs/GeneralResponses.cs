using Swashbuckle.AspNetCore.Annotations;

namespace ReviewService.Gateway.DTOs;

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

    [SwaggerSchema(Nullable = true)]
    public Guid? CompanyId { get; init; }

    public required string Text { get; init; }
    public required long Score { get; init; }
    public required DateTimeOffset CreatedAt { get; init; }
    public required IReadOnlyList<FlagDto> Flags { get; init; }
}

public sealed record VoteReviewRequest
{
    public required VoteMode Mode { get; init; }
}

public enum VoteMode
{
    Like = 0,
    Dislike = 1,
    Clear = 2
}

public sealed record ReportReviewRequest
{
    public required ReportReasonType ReasonType { get; init; }

    [SwaggerSchema(Nullable = true)]
    public string? ReasonText { get; init; }
}

// подгони под свой справочник причин
public enum ReportReasonType
{
    Spam = 0,
    Harassment = 1,
    Hate = 2,
    Nudity = 3,
    Violence = 4,
    Other = 99
}