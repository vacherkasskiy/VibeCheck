using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ReviewService.CloudStorage.Abstractions.Models;
using ReviewService.Core.Abstractions.Helpers;
using ReviewService.Core.Abstractions.Operations.Companies;
using ReviewService.Core.Abstractions.Operations.Flags;
using ReviewService.Core.Abstractions.Operations.Reviews;
using ReviewService.Core.Helpers;
using ReviewService.Core.MapperProfiles;
using ReviewService.Core.Operations.Companies;
using ReviewService.Core.Operations.Flags;
using ReviewService.Core.Operations.Reviews;
using ReviewService.PersistentStorage.Abstractions.Options;

namespace ReviewService.Core;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddCoreServices(this IServiceCollection services)
    {
        // Companies
        services.AddScoped<IGetCompaniesOperation, GetCompaniesOperation>();
        services.AddScoped<IGetCompanyFlagsOperation, GetCompanyFlagsOperation>();
        services.AddScoped<IGetCompanyOperation, GetCompanyOperation>();

        services.AddScoped<ICreateCompanyRequestOperation, CreateCompanyRequestOperation>();

        // Reviews
        services.AddScoped<IGetCompanyReviewsOperation, GetCompanyReviewsOperation>();
        services.AddScoped<IGetMyReviewsOperation, GetMyReviewsOperation>();
        services.AddScoped<IGetUserReviewsOperation, GetUserReviewsOperation>();

        services.AddScoped<ICreateCompanyReviewOperation, CreateCompanyReviewOperation>();
        services.AddScoped<IUpdateCompanyReviewOperation, UpdateCompanyReviewOperation>();
        services.AddScoped<IDeleteCompanyReviewOperation, DeleteCompanyReviewOperation>();
        services.AddScoped<IVoteReviewOperation, VoteReviewOperation>();
        services.AddScoped<IReportReviewOperation, ReportReviewOperation>();
        
        // Flags
        services.AddScoped<IGetAllFlagsOperation, GetAllFlagsOperation>();
        
        // Helpers
        services.AddSingleton<ICurrentUserAccessor, JwtCurrentUserAccessor>();

        return services;
    }

    public static IServiceCollection AddApplicationOptions(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<DbOptions>(
            configuration.GetSection(nameof(DbOptions)));
        
        services.Configure<MinioOptions>(
            configuration.GetSection(nameof(MinioOptions)));

        return services;
    }

    public static IServiceCollection AddCoreMapperProfiles(
        this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(SharedOperationsProfiles).Assembly);

        return services;
    }
}