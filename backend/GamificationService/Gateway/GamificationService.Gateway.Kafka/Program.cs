using GamificationService.Gateway.Kafka.Configurations;
using GamificatonService.Core;
using GamificatonService.MessageBroker;
using GamificatonService.PersistentStorage.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.AddApplicationLogging();

builder.Services
    .AddApplicationOptions(builder.Configuration)
    .AddApplicationHealthChecks()
    .AddCoreHandlers()
    .AddProducerServices()
    .AddConsumerServices()
    .AddPersistentStorageMapperProfiles()
    .AddPersistentStorageServices();

var app = builder.Build();

var logger = app.Services.GetRequiredService<ILoggerFactory>()
    .CreateLogger("Startup");

app.UseApplicationLogging();
app.UseApplicationHealthChecks();

try
{
    app.Run();
}
catch (Exception exception)
{
    logger.LogCritical(exception, "Gamification service terminated unexpectedly");
}
