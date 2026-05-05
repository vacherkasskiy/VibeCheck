namespace GamificatonService.PersistentStorage.Abstractions.Models.AddUserXpTransaction;

public sealed record AddUserXpTransactionRepositoryInputModel
{
    public required Guid Id { get; init; }
    public required Guid UserId { get; init; }
    public required Guid XpRuleId { get; init; }
    public required long XpAmount { get; init; }
    public string? EventId { get; init; }
    public string? AggregateId { get; init; }
    public required DateTimeOffset CreatedAt { get; init; }
}