namespace ReviewService.PersistentStorage.Abstractions.Models.Flags;

public sealed record GetUserFlagsRepositoryModel
{
    public required IReadOnlyCollection<GetUserFlagGroupRepositoryModel> GreenFlags { get; init; }
    public required IReadOnlyCollection<GetUserFlagGroupRepositoryModel> RedFlags { get; init; }
}

public sealed record GetUserFlagGroupRepositoryModel
{
    public required int Weight { get; init; }
    public required IReadOnlyCollection<Guid> Flags { get; init; }
}
