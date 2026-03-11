using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using ReviewService.PersistentStorage.Abstractions.Options;
using ReviewService.PersistentStorage.Abstractions.Repositories.Companies;
using ReviewService.PersistentStorage.Abstractions.Repositories.Reviews;
using ReviewService.PersistentStorage.Abstractions.Repositories.UserProfiles;
using ReviewService.PersistentStorage.MapperProfiles;
using ReviewService.PersistentStorage.Repositories.Companies;
using ReviewService.PersistentStorage.Repositories.Reviews;
using ReviewService.PersistentStorage.Repositories.UserProfiles;

namespace ReviewService.PersistentStorage.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddPersistentStorageServices(this IServiceCollection services)
    {
        services.AddScoped<ICompaniesQueryRepository, CompaniesQueryRepository>();
        services.AddScoped<ICompaniesCommandRepository, CompaniesCommandRepository>();

        services.AddScoped<IReviewsQueryRepository, ReviewsQueryRepository>();
        services.AddScoped<IReviewsCommandRepository, ReviewsCommandRepository>();
        
        services.AddScoped<IUserProfilesQueryRepository, UserProfilesQueryRepository>();
        
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
        services.AddAutoMapper(typeof(CompaniesRepositoryProfile).Assembly);

        return services;
    }
}