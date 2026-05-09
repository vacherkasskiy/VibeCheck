namespace GamificatonService.PersistentStorage.Abstractions.Models.AddXp;

public sealed class AddXpRepositoryOutputModel
{
    public required long NewTotalXp { get; init; }
    public required int PreviousLevel { get; init; }
    public required int NewLevel { get; init; }
    public bool WasLevelUp => NewLevel > PreviousLevel;
}