using GamificatonService.Gateway.MapperProfiles;

namespace GamificatonService.Gateway.Configurations;

public static class MapperConfiguration
{
    public static IServiceCollection AddGatewayMapperProfiles(this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(SharedProfiles).Assembly);

        return services;
    }
}