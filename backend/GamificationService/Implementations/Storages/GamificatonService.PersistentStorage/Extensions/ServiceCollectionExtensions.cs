using GamificatonService.PersistentStorage.Abstractions.Options;
using GamificatonService.PersistentStorage.Abstractions.Repositories.Command;
using GamificatonService.PersistentStorage.Abstractions.Repositories.Query;
using GamificatonService.PersistentStorage.Repositories.Command;
using GamificatonService.PersistentStorage.Repositories.Query;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace GamificatonService.PersistentStorage.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddPersistentStorageServices(this IServiceCollection services)
    {
        // Query
        services.AddScoped<IAchievementsQueryRepository, AchievementsQueryRepository>();
        services.AddScoped<ILevelsQueryRepository, LevelsQueryRepository>();
        services.AddScoped<IXpRulesQueryRepository, XpRulesQueryRepository>();
        services.AddScoped<IUserActivityCountersQueryRepository, UserActivityCountersQueryRepository>();

        // Command
        services.AddScoped<IAchievementsCommandRepository, AchievementsCommandRepository>();
        services.AddScoped<ILevelsCommandRepository, LevelsCommandRepository>();
        services.AddScoped<IXpTransactionsCommandRepository, XpTransactionsCommandRepository>();
        
        services.AddDbContext<AppDbContext>((sp, options) =>
        {
            var postgresOptions = sp.GetRequiredService<IOptions<DbOptions>>().Value;

            options.UseNpgsql(
                postgresOptions.ConnectionString,
                npgsqlOptions =>
                {
                    npgsqlOptions.CommandTimeout(postgresOptions.CommandTimeout);
                });
        });

        return services;
    }
    
    public static IServiceCollection AddPersistentStorageMapperProfiles(
        this IServiceCollection services)
    {
        //services.AddAutoMapper(typeof(CompaniesRepositoryProfile).Assembly);

        return services;
    }
}