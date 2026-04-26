using Serilog;
using Serilog.Events;
using Serilog.Formatting.Compact;

namespace GamificatonService.Gateway.Configurations;

public static class LoggingConfiguration
{
    public static WebApplicationBuilder AddApplicationLogging(
        this WebApplicationBuilder builder)
    {
        builder.Host.UseSerilog((context, services, loggerConfiguration) =>
        {
            loggerConfiguration
                .ReadFrom.Configuration(context.Configuration)
                .ReadFrom.Services(services)
                .Enrich.FromLogContext()
                .Enrich.WithProperty("service", "gamification-service")
                .Enrich.WithProperty("environment", context.HostingEnvironment.EnvironmentName)
                .WriteTo.Console(new RenderedCompactJsonFormatter());
        });

        return builder;
    }

    public static void UseApplicationLogging(this WebApplication app)
    {
        app.UseSerilogRequestLogging(options =>
        {
            options.MessageTemplate =
                "HTTP {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms";
            options.GetLevel = (httpContext, _, exception) =>
            {
                if (exception is not null || httpContext.Response.StatusCode >= 500)
                    return LogEventLevel.Error;

                if (httpContext.Response.StatusCode >= 400)
                    return LogEventLevel.Warning;

                return LogEventLevel.Information;
            };
            options.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
            {
                diagnosticContext.Set("traceId", httpContext.TraceIdentifier);
                diagnosticContext.Set("requestHost", httpContext.Request.Host.Value ?? string.Empty);
                diagnosticContext.Set("requestScheme", httpContext.Request.Scheme);

                if (httpContext.User.Identity?.IsAuthenticated == true)
                {
                    var userId = httpContext.User.FindFirst("sub")?.Value
                                 ?? httpContext.User.FindFirst("userId")?.Value;

                    if (!string.IsNullOrWhiteSpace(userId))
                        diagnosticContext.Set("userId", userId);
                }
            };
        });
    }
}
