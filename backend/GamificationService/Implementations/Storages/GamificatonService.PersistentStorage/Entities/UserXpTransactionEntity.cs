namespace GamificatonService.PersistentStorage.Entities;

public sealed class UserXpTransactionEntity
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }

    public Guid XpRuleId { get; set; }
    public XpRuleEntity XpRule { get; set; } = null!;

    public long XpAmount { get; set; }

    public string? EventId { get; set; }
    public string? AggregateId { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
}