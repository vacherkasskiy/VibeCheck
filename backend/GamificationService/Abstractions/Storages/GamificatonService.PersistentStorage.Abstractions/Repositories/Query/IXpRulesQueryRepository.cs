using GamificatonService.PersistentStorage.Abstractions.Models.XpRule;

namespace GamificatonService.PersistentStorage.Abstractions.Repositories.Query;

public interface IXpRulesQueryRepository
{
    Task<IReadOnlyCollection<XpRuleRepositoryOutputModel>> GetActiveByActionKeyAsync(
        GetXpRulesByActionKeyRepositoryInputModel input,
        CancellationToken ct);
}