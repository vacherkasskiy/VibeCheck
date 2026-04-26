using Prometheus;

namespace ReviewService.Gateway.Configurations;

public static class ObservabilityConfiguration
{ 
    public static void UseApplicationObservability(this WebApplication app)
    {
        app.UseHttpMetrics();
        app.UseMetricServer();
    }
}
