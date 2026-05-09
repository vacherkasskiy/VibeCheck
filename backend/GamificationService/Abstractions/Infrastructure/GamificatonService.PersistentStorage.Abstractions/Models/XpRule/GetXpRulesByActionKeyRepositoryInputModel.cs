namespace GamificatonService.PersistentStorage.Abstractions.Models.XpRule;

public sealed record GetXpRulesByActionKeyRepositoryInputModel
{
    public required string ActionKey { get; init; }
}