using GamificationService.Gateway.API.Options;
using Microsoft.Extensions.Options;
using Prometheus;

namespace GamificationService.Gateway.API.Configurations;

public static class ObservabilityConfiguration
{ 
    public static void UseApplicationObservability(this WebApplication app)
    {
        app.UseHttpMetrics();
        app.UseMetricServer();
    }
}