using GamificatonService.Core.Abstractions.Operations.Achievements;
using GamificatonService.Core.Abstractions.Operations.Levels;
using GamificatonService.Core.Operations.Achievements;
using GamificatonService.Core.Operations.Levels;
using Microsoft.Extensions.DependencyInjection;

namespace GamificatonService.Core;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddCoreServices(
        this IServiceCollection services)
    {
        services.AddScoped<IGetMyAchievementsOperation, GetMyAchievementsOperation>();
        services.AddScoped<IGetUserAchievementsOperation, GetUserAchievementsOperation>();
        services.AddScoped<IGetMyLevelOperation, GetMyLevelOperation>();
        services.AddScoped<IGetUserLevelOperation, GetUserLevelOperation>();

        return services;
    }
}