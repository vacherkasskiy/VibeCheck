using Prometheus;

namespace ReviewService.Gateway.Api.Configurations;

public static class ObservabilityConfiguration
{ 
    public static void UseApplicationObservability(this WebApplication app)
    {
        app.UseHttpMetrics();
        app.UseMetricServer();
    }
}
