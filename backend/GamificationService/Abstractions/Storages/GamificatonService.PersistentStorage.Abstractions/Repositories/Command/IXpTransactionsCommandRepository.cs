using GamificatonService.PersistentStorage.Abstractions.Models.AddUserXpTransaction;
using GamificatonService.PersistentStorage.Abstractions.Models.UserXp;

namespace GamificatonService.PersistentStorage.Abstractions.Repositories.Command;

public interface IXpTransactionsCommandRepository
{
    Task<bool> ExistsAsync(
        ExistsUserXpTransactionRepositoryInputModel input,
        CancellationToken ct);

    Task AddAsync(
        AddUserXpTransactionRepositoryInputModel input,
        CancellationToken ct);
}