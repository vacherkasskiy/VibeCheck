namespace GamificatonService.Gateway.DTOs.GetLevel;

public sealed record GetLevelResponse
{
    public required int CurrentLevel { get; init; }
    public required ProgressIntDto Progress { get; init; }
}

public sealed record ProgressIntDto
{
    public required int Current { get; init; }
    public required int Target { get; init; }
}