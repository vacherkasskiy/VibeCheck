namespace GamificatonService.PersistentStorage.Abstractions.Models.AddXp;

public sealed class AddXpRepositoryInputModel
{
    public required Guid UserId { get; init; }
    public required long XpDelta { get; init; }
    public required DateTimeOffset UtcNow { get; init; }
}