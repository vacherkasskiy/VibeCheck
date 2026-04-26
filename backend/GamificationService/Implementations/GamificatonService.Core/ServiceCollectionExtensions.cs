using GamificatonService.CloudStorage.Abstractions.Options;
using GamificatonService.Core.Abstractions;
using GamificatonService.Core.Abstractions.Handlers;
using GamificatonService.Core.Abstractions.Helpers;
using GamificatonService.Core.Abstractions.Operations.Achievements;
using GamificatonService.Core.Abstractions.Operations.Levels;
using GamificatonService.Core.Handlers;
using GamificatonService.Core.Helpers;
using GamificatonService.Core.MapperProfiles;
using GamificatonService.Core.Operations.Achievements;
using GamificatonService.Core.Operations.Levels;
using GamificatonService.MessageBroker.Abstractions.Options;
using GamificatonService.PersistentStorage.Abstractions.Options;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace GamificatonService.Core;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddCoreServices(
        this IServiceCollection services)
    {
        // Operations
        services.AddScoped<IGetMyAchievementsOperation, GetMyAchievementsOperation>();
        services.AddScoped<IGetUserAchievementsOperation, GetUserAchievementsOperation>();
        services.AddScoped<IGetUserLevelOperation, GetUserLevelOperation>();
        
        // Helpers
        services.AddSingleton<ICurrentUserAccessor, JwtCurrentUserAccessor>();
        
        // Handler
        services.AddScoped<IAchievementProgressService, AchievementProgressService>();
        services.AddScoped<IXpProgressService, XpProgressService>();

        return services;
    }

    public static IServiceCollection AddCoreMapperProfiles(
        this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(SharedOperationsProfiles).Assembly);

        return services;
    }
    
    public static IServiceCollection AddApplicationOptions(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<DbOptions>(
            configuration.GetSection(nameof(DbOptions)));
        
        services.Configure<KafkaOptions>(
            configuration.GetSection(nameof(KafkaOptions)));
        
        services.Configure<MinioOptions>(
            configuration.GetSection(nameof(MinioOptions)));

        return services;
    }
}