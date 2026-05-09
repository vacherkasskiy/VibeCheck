namespace GamificatonService.PersistentStorage.Abstractions.Models.XpRule;

public sealed record XpRuleRepositoryOutputModel
{
    public required Guid Id { get; init; }
    public required string Code { get; init; }
    public required string Name { get; init; }
    public required XpRuleTypeRepositoryEnum Type { get; init; }
    public required string ActionKey { get; init; }
    public required long XpAmount { get; init; }
    public long? ThresholdValue { get; init; }
    public required bool IsRepeatable { get; init; }
    public int? CooldownDays { get; init; }
}

public enum XpRuleTypeRepositoryEnum
{
    Action = 1,
    Threshold = 2
}