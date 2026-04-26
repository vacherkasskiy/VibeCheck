using GamificatonService.PersistentStorage.Abstractions.Models.UserActivity;
using GamificatonService.PersistentStorage.Abstractions.Repositories.Query;
using GamificatonService.PersistentStorage.Entities;
using Microsoft.EntityFrameworkCore;

namespace GamificatonService.PersistentStorage.Repositories.Query;

internal sealed class UserActivityCountersQueryRepository(AppDbContext dbContext)
    : IUserActivityCountersQueryRepository
{
    public async Task<long> GetCountByActionKeyAsync(
        GetUserActivityCountByActionKeyRepositoryInputModel input,
        CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();

        if (input.UserId == Guid.Empty || string.IsNullOrWhiteSpace(input.ActionKey))
            return 0;

        return await dbContext.UserXpTransactions
            .AsNoTracking()
            .Where(t => t.UserId == input.UserId)
            .Join(
                dbContext.XpRules.AsNoTracking(),
                t => t.XpRuleId,
                r => r.Id,
                (t, r) => new { t, r })
            .Where(x => x.r.ActionKey == input.ActionKey)
            .Where(x => x.r.Type == XpRuleTypeEntityEnum.Action)
            .LongCountAsync(ct);
    }
}