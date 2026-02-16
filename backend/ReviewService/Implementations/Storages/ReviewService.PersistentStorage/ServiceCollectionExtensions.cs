using Microsoft.Extensions.DependencyInjection;
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

        return services;
    }
}