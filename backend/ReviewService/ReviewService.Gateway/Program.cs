using System.Text.Json.Serialization;
using ReviewService.Core;
using ReviewService.Gateway.Configurations;
using ReviewService.PersistentStorage.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddGatewayMapperProfiles()
    .AddCoreMapperProfiles()
    .AddApplicationOptions(builder.Configuration)
    .AddCoreServices()
    .AddPersistentStorageMapperProfiles()
    .AddPersistentStorageServices()
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new JsonStringEnumConverter());
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

await app.Services.ApplyPersistentStorageMigrationsAndSeedAsync();

app.Run();