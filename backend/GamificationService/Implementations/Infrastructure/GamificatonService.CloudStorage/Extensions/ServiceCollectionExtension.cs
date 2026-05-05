using GamificatonService.CloudStorage.Abstractions.Services;
using GamificatonService.CloudStorage.Services;
using Microsoft.Extensions.DependencyInjection;

namespace GamificatonService.CloudStorage.Extensions;

public static class ServiceCollectionExtension
{
    public static IServiceCollection AddMinioServices(this IServiceCollection services)
    {
        services.AddSingleton<IAchievementsIconsStorage, AchievementsIconsStorage>();
        
        return services;
    }
}