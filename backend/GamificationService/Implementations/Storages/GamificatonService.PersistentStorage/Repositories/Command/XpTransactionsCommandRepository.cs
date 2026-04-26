using GamificatonService.PersistentStorage.Abstractions.Models.AddUserXpTransaction;
using GamificatonService.PersistentStorage.Abstractions.Models.UserXp;
using GamificatonService.PersistentStorage.Abstractions.Repositories.Command;
using GamificatonService.PersistentStorage.Entities;
using Microsoft.EntityFrameworkCore;

namespace GamificatonService.PersistentStorage.Repositories.Command;

internal sealed class XpTransactionsCommandRepository(
    AppDbContext dbContext) : IXpTransactionsCommandRepository
{
    public async Task<bool> ExistsAsync(
        ExistsUserXpTransactionRepositoryInputModel input,
        CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();

        if (input.UserId == Guid.Empty || input.XpRuleId == Guid.Empty || string.IsNullOrWhiteSpace(input.EventId))
            return false;

        return await dbContext.UserXpTransactions
            .AsNoTracking()
            .AnyAsync(
                x => x.UserId == input.UserId
                     && x.XpRuleId == input.XpRuleId
                     && x.EventId == input.EventId,
                ct);
    }

    public async Task AddAsync(
        AddUserXpTransactionRepositoryInputModel input,
        CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();

        var entity = new UserXpTransactionEntity
        {
            Id = input.Id,
            UserId = input.UserId,
            XpRuleId = input.XpRuleId,
            XpAmount = input.XpAmount,
            EventId = input.EventId,
            AggregateId = input.AggregateId,
            CreatedAt = input.CreatedAt
        };

        dbContext.UserXpTransactions.Add(entity);

        await dbContext.SaveChangesAsync(ct);
    }
}