using Microsoft.Extensions.DependencyInjection;
using ReviewService.CloudStorage.Abstractions.Services;
using ReviewService.CloudStorage.Services;

namespace ReviewService.CloudStorage.Extensions;

public static class ServiceCollectionExtension
{
    public static IServiceCollection AddMinioServices(this IServiceCollection services)
    {
        services.AddSingleton<ICompanyIconsStorage, CompanyIconsMinioStorage>();
        
        return services;
    }
}