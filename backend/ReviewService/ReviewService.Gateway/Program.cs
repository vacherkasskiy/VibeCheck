using System.Text.Json.Serialization;
using ReviewService.Core;
using ReviewService.Gateway.Configurations;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddGatewayMapperProfiles()
    .AddCoreMapperProfiles()
    .AddCoreServices()
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