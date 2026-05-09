using System.Text.Json.Serialization;
using GamificatonService.CloudStorage.Extensions;
using GamificatonService.Core;
using GamificationService.Gateway.API.Configurations;
using GamificatonService.PersistentStorage.Extensions;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.AddApplicationLogging();

builder.Services
    .AddGatewayMapperProfiles()
    .AddCoreMapperProfiles()
    .AddApplicationCors()
    .AddApplicationOptions(builder.Configuration)
    .AddApplicationHealthChecks()
    .AddMinioServices()
    .AddCoreServices()
    .AddPersistentStorageMapperProfiles()
    .AddPersistentStorageServices()
    .AddJwtAuth(builder.Configuration)
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new JsonStringEnumConverter());
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

var logger = app.Services.GetRequiredService<ILoggerFactory>()
    .CreateLogger("Startup");

app.UseSwagger();
app.UseSwaggerUI();

app.UseApplicationLogging();
app.UseHttpsRedirection();
app.UseApplicationCors();
app.UseAuthentication();
app.UseAuthorization();
app.UseApplicationHealthChecks();
app.UseApplicationObservability();
app.MapControllers();

logger.LogInformation("Applying persistent storage migrations for gamification service");
await app.Services.ApplyPersistentStorageMigrationsAndSeedAsync();
logger.LogInformation("Ensuring cloud storage seed for gamification service");
await app.Services.EnsureCloudStorageSeededAsync();

logger.LogInformation("Gamification service is starting");

try
{
    app.Run();
}
catch (Exception exception)
{
    Log.Fatal(exception, "Gamification service terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
