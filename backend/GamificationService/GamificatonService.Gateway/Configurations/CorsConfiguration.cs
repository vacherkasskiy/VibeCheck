namespace GamificatonService.Gateway.Configurations;

public static class CorsConfiguration
{
    private const string PolicyName = "AllowAll";
    
    public static IServiceCollection AddApplicationCors(this IServiceCollection services)
    {
        services.AddCors(options =>
        {
            options.AddPolicy(PolicyName, policy =>
            {
                policy
                    .SetIsOriginAllowed(_ => true)
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials();
            });
        });
        
        return services;
    }

    public static void UseApplicationCors(this WebApplication app)
    {
        app.UseCors(PolicyName);
    }
}