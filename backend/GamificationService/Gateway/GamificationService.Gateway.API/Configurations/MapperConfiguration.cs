using GamificationService.Gateway.API.MapperProfiles;

namespace GamificationService.Gateway.API.Configurations;

public static class MapperConfiguration
{
    public static IServiceCollection AddGatewayMapperProfiles(this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(SharedGatewayProfiles).Assembly);

        return services;
    }
}