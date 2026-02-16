using Microsoft.Extensions.DependencyInjection;
using ReviewService.Core.Abstractions.Operations.Companies;
using ReviewService.Core.Operations.Companies;

namespace ReviewService.Core;

public static class ServiceCollectionExtension
{
    public static IServiceCollection AddCoreServices(this IServiceCollection services)
    {
        services.AddScoped<IGetCompaniesOperation, GetCompaniesOperation>();
        services.AddScoped<IGetCompanyFlagsOperation, GetCompanyFlagsOperation>();
        services.AddScoped<IGetCompanyOperation, GetCompanyOperation>();

        return services;
    }
}