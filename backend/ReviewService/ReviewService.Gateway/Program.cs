using System.Text.Json.Serialization;
using ReviewService.Core;
using ReviewService.Gateway.Configurations;
using ReviewService.PersistentStorage;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddGatewayMapperProfiles()
    .AddCoreMapperProfiles()
    .AddCoreServices()
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
app.Run();