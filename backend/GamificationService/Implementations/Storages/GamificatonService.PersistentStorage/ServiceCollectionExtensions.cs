using GamificatonService.PersistentStorage.Abstractions.Repositories.Query;
using GamificatonService.PersistentStorage.Mocks;
using Microsoft.Extensions.DependencyInjection;

namespace GamificatonService.PersistentStorage;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddPersistentStorageServices(
        this IServiceCollection services)
    {
        services.AddScoped<IAchievementsQueryRepository, MockAchievementsQueryRepository>();
        services.AddScoped<ILevelsQueryRepository, MockLevelsQueryRepository>();

        return services;
    }
}