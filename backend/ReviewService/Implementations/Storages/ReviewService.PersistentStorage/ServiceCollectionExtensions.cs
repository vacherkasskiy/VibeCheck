using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using ReviewService.PersistentStorage.Abstractions.Options;
using ReviewService.PersistentStorage.Abstractions.Repositories.Companies;
using ReviewService.PersistentStorage.Abstractions.Repositories.Reviews;
using ReviewService.PersistentStorage.Repositories.Companies;
using ReviewService.PersistentStorage.Repositories.Reviews;

namespace ReviewService.PersistentStorage;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddPersistentStorageServices(this IServiceCollection services)
    {
        services.AddScoped<ICompaniesQueryRepository,  MockCompaniesQueryRepository>();
        services.AddScoped<IReviewsQueryRepository,  MockReviewsQueryRepository>();
        
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
}