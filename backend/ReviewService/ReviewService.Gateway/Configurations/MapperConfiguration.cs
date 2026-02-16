using ReviewService.Gateway.MapperProfiles;

namespace ReviewService.Gateway.Configurations;

public static class MapperConfiguration
{
    public static IServiceCollection AddGatewayMapperProfiles(this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(SharedGatewayProfiles).Assembly);

        return services;
    }
}