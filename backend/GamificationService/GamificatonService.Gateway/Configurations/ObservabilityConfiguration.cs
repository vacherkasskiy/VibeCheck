using GamificatonService.Gateway.Options;
using Microsoft.Extensions.Options;
using Prometheus;

namespace GamificatonService.Gateway.Configurations;

public static class ObservabilityConfiguration
{ 
    public static void UseApplicationObservability(this WebApplication app)
    {
        app.UseHttpMetrics();
        app.UseMetricServer();
    }
}