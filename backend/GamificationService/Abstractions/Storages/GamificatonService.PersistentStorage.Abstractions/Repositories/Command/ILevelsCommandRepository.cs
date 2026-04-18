using GamificatonService.PersistentStorage.Abstractions.Models.AddXp;

namespace GamificatonService.PersistentStorage.Abstractions.Repositories.Command;

public interface ILevelsCommandRepository
{
    Task<AddXpRepositoryOutputModel> AddXpAsync(
        AddXpRepositoryInputModel input,
        CancellationToken ct);
}