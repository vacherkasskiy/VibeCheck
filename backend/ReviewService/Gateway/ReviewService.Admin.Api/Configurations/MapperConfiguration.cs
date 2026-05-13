using ReviewService.Admin.Api.MapperProfiles;

namespace ReviewService.Admin.Api.Configurations;

public static class MapperConfiguration
{
    public static IServiceCollection AddAdminMapperProfiles(this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(AdminMapperProfile).Assembly);

        return services;
    }
}
