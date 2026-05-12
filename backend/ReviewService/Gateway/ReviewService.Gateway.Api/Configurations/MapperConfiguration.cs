using ReviewService.Gateway.Api.MapperProfiles;

namespace ReviewService.Gateway.Api.Configurations;

public static class MapperConfiguration
{
    public static IServiceCollection AddGatewayMapperProfiles(this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(SharedGatewayProfiles).Assembly);

        return services;
    }
}