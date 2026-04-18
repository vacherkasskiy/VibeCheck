using System.Text.Json.Serialization;
using ReviewService.CloudStorage.Extensions;
using ReviewService.Core;
using ReviewService.Gateway.Configurations;
using ReviewService.MessageBroker;
using ReviewService.PersistentStorage.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddGatewayMapperProfiles()
    .AddCoreMapperProfiles()
    .AddApplicationCors()
    .AddApplicationObservability(builder.Configuration)
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
