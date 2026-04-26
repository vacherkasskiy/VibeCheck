namespace ReviewService.Gateway.DTOs.Flags;

public sealed record GetMyUserFlagsResponse
{
    public required IReadOnlyCollection<UserFlagGroupResponse> GreenFlags { get; init; }
    public required IReadOnlyCollection<UserFlagGroupResponse> RedFlags { get; init; }
}

public sealed record UserFlagGroupResponse
{
    public required int Weight { get; init; }
    public required IReadOnlyCollection<Guid> Flags { get; init; }
}
