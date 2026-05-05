using GamificatonService.PersistentStorage.Abstractions.Models.XpRule;
using GamificatonService.PersistentStorage.Abstractions.Repositories.Query;
using Microsoft.EntityFrameworkCore;

namespace GamificatonService.PersistentStorage.Repositories.Query;

internal sealed class XpRulesQueryRepository(AppDbContext dbContext) : IXpRulesQueryRepository
{
    public async Task<IReadOnlyCollection<XpRuleRepositoryOutputModel>> GetActiveByActionKeyAsync(
        GetXpRulesByActionKeyRepositoryInputModel input,
        CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();

        if (string.IsNullOrWhiteSpace(input.ActionKey))
            return [];

        var items = await dbContext.XpRules
            .AsNoTracking()
            .Where(x => x.IsActive && x.ActionKey == input.ActionKey)
            .OrderBy(x => x.Type)
            .ThenBy(x => x.ThresholdValue)
            .ThenBy(x => x.Code)
            .Select(x => new XpRuleRepositoryOutputModel
            {
                Id = x.Id,
                Code = x.Code,
                Name = x.Name,
                Type = (XpRuleTypeRepositoryEnum)x.Type,
                ActionKey = x.ActionKey,
                XpAmount = x.XpAmount,
                ThresholdValue = x.ThresholdValue,
                IsRepeatable = x.IsRepeatable,
                CooldownDays = x.CooldownDays
            })
            .ToListAsync(ct);

        return items;
    }
}