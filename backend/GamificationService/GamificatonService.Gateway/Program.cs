using System.Text.Json.Serialization;
using GamificatonService.CloudStorage.Extensions;
using GamificatonService.Core;
using GamificatonService.Gateway.Configurations;
using GamificatonService.MessageBroker;
using GamificatonService.PersistentStorage.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddGatewayMapperProfiles()
    .AddCoreMapperProfiles()
    .AddApplicationCors()
    .AddApplicationOptions(builder.Configuration)
    .AddApplicationHealthChecks()
    .AddMinioServices()
    .AddCoreServices()
    .AddMessageBrokerServices()
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

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.UseApplicationCors();
app.UseAuthentication();
app.UseAuthorization();
app.UseApplicationHealthChecks();
app.UseApplicationObservability();
app.MapControllers();

await app.Services.ApplyPersistentStorageMigrationsAndSeedAsync();
await app.Services.EnsureCloudStorageSeededAsync();

app.Run();
