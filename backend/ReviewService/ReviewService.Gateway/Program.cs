using System.Text.Json.Serialization;
using ReviewService.CloudStorage.Extensions;
using ReviewService.Core;
using ReviewService.Gateway.Configurations;
using ReviewService.MessageBroker;
using ReviewService.PersistentStorage.Extensions;
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
    .AddMessageBrokerServices()
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

logger.LogInformation("Applying persistent storage migrations for review service");
await app.Services.ApplyPersistentStorageMigrationsAndSeedAsync();
logger.LogInformation("Ensuring cloud storage seed for review service");
await app.Services.EnsureCloudStorageSeededAsync();

logger.LogInformation("Review service is starting");

try
{
    app.Run();
}
catch (Exception exception)
{
    Log.Fatal(exception, "Review service terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
