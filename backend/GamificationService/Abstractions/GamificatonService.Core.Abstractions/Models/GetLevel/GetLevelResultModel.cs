namespace GamificatonService.Core.Abstractions.Models.GetLevel;

public sealed record GetLevelResultModel
{
    public required int CurrentLevel { get; init; }
    public required ProgressIntModel Progress { get; init; }
}

public sealed record ProgressIntModel
{
    public required int Current { get; init; }
    public required int Target { get; init; }
}