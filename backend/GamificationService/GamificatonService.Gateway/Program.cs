using System.Text.Json.Serialization;
using GamificatonService.CloudStorage.Extensions;
using GamificatonService.Core;
using GamificatonService.Gateway.Configurations;
using GamificatonService.PersistentStorage.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddGatewayMapperProfiles()
    .AddCoreMapperProfiles()
    .AddApplicationOptions(builder.Configuration)
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

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();