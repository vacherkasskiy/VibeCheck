namespace ReviewService.Gateway.Api.DTOs.Flags;

public sealed record GetUserFlagsResponse
{
    public required IReadOnlyCollection<UserFlagGroupResponse> GreenFlags { get; init; }
    public required IReadOnlyCollection<UserFlagGroupResponse> RedFlags { get; init; }
}
