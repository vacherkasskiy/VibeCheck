namespace GamificatonService.PersistentStorage.Abstractions.Models.UserXp;

public sealed record ExistsUserXpTransactionRepositoryInputModel
{
    public required Guid UserId { get; init; }
    public required Guid XpRuleId { get; init; }
    public required string EventId { get; init; }
}