namespace GamificatonService.PersistentStorage.Abstractions.Models.Levels;

public sealed record GetLevelRepositoryOutputModel
{
    public required int CurrentLevel { get; init; }
    public required int ProgressCurrent { get; init; }
    public required int ProgressTarget { get; init; }
}