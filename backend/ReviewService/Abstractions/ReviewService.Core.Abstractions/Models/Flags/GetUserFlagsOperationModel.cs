namespace ReviewService.Core.Abstractions.Models.Flags;

public sealed record GetUserFlagsOperationModel
{
    public required IReadOnlyCollection<GetUserFlagGroupOperationModel> GreenFlags { get; init; }
    public required IReadOnlyCollection<GetUserFlagGroupOperationModel> RedFlags { get; init; }
}

public sealed record GetUserFlagGroupOperationModel
{
    public required int Weight { get; init; }
    public required IReadOnlyCollection<Guid> Flags { get; init; }
}
