namespace GamificatonService.PersistentStorage.Entities;

public sealed class XpRuleEntity
{
    public Guid Id { get; set; }
    public string Code { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;

    public XpRuleTypeEntityEnum Type { get; set; }

    public string ActionKey { get; set; } = null!;
    public long XpAmount { get; set; }

    public long? ThresholdValue { get; set; }

    public bool IsActive { get; set; }

    public bool IsRepeatable { get; set; }

    public int? CooldownDays { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public enum XpRuleTypeEntityEnum
{
    Action = 1,      // разовое или повторяемое действие
    Threshold = 2    // достижение порога
}