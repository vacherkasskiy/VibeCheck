using Microsoft.Extensions.Options;
using Prometheus;
using ReviewService.Gateway.Options;

namespace ReviewService.Gateway.Configurations;

public static class ObservabilityConfiguration
{
    public static IServiceCollection AddApplicationObservability(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<ObservabilityOptions>(
            configuration.GetSection(ObservabilityOptions.SectionName));

        return services;
    }

    public static void UseApplicationObservability(this WebApplication app)
    {
        var options = app.Services.GetRequiredService<IOptions<ObservabilityOptions>>().Value;

        app.UseHttpMetrics();
        app.UseMetricServer(options.MetricsPort, options.MetricsEndpointPath);
    }
}
