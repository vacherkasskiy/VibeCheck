namespace GamificatonService.Core.Abstractions.Models.GetLevel;

public sealed record GetLevelOperationResultModel
{
    public required int CurrentLevel { get; init; }
    public required ProgressIntOperationModel Progress { get; init; }
}

public sealed record ProgressIntOperationModel
{
    public required int Current { get; init; }
    public required int Target { get; init; }
}