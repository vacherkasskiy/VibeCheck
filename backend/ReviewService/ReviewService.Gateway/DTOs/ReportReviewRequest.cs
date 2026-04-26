using Swashbuckle.AspNetCore.Annotations;

namespace ReviewService.Gateway.DTOs;

public sealed record ReportReviewRequest
{
    public required ReportReasonGatewayEnum ReasonType { get; init; }

    [SwaggerSchema(Nullable = true)]
    public string? ReasonText { get; init; }
}

public enum ReportReasonGatewayEnum
{
    Spam = 0,
    Harassment = 1,
    Hate = 2,
    Nudity = 3,
    Violence = 4,
    Other = 99
}