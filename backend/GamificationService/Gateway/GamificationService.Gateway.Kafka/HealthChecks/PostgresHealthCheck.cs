using GamificatonService.PersistentStorage.Abstractions.Options;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Options;
using Npgsql;

namespace GamificationService.Gateway.Kafka.HealthChecks;

public sealed class PostgresHealthCheck : IHealthCheck
{
    private readonly DbOptions _db;

    public PostgresHealthCheck(IOptions<DbOptions> dbOptions)
        => _db = dbOptions.Value;

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken ct = default)
    {
        try
        {
            var connectionString = new NpgsqlConnectionStringBuilder
            {
                Host = _db.Host,
                Port = _db.Port,
                Database = _db.Database,
                Username = _db.Username,
                Password = _db.Password,
                Timeout = 3,
                CommandTimeout = 3,
                SslMode = SslMode.Disable
            }.ConnectionString;

            await using var connection = new NpgsqlConnection(connectionString);
            await connection.OpenAsync(ct);

            await using var command = new NpgsqlCommand("select 1", connection);
            command.CommandTimeout = 3;
            _ = await command.ExecuteScalarAsync(ct);

            return HealthCheckResult.Healthy("postgres is reachable");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("postgres is NOT reachable", ex);
        }
    }
}
