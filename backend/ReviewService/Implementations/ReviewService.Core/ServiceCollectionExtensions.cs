using Microsoft.Extensions.DependencyInjection;
using ReviewService.Core.Abstractions.Operations.Companies;
using ReviewService.Core.Abstractions.Operations.Reviews;
using ReviewService.Core.MapperProfiles;
using ReviewService.Core.Operations.Companies;
using ReviewService.Core.Operations.Reviews;

namespace ReviewService.Core;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddCoreServices(this IServiceCollection services)
    {
        // Companies
        services.AddScoped<IGetCompaniesOperation, GetCompaniesOperation>();
        services.AddScoped<IGetCompanyFlagsOperation, GetCompanyFlagsOperation>();
        services.AddScoped<IGetCompanyOperation, GetCompanyOperation>();
        
        // Reviews
        services.AddScoped<IGetCompanyReviewsOperation, GetCompanyReviewsOperation>();
        services.AddScoped<IGetMyReviewsOperation, GetMyReviewsOperation>();
        services.AddScoped<IGetUserReviewsOperation, GetUserReviewsOperation>();

        return services;
    }
    
    public static IServiceCollection AddCoreMapperProfiles(
        this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(SharedOperationsProfiles).Assembly);

        return services;
    }
}