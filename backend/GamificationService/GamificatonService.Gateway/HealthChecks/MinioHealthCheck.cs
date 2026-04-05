using System.Net.Sockets;
using GamificatonService.CloudStorage.Abstractions.Options;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Options;

namespace GamificatonService.Gateway.HealthChecks;

public sealed class MinioHealthCheck : IHealthCheck
{
    private readonly MinioOptions _minio;

    public MinioHealthCheck(IOptions<MinioOptions> options)
        => _minio = options.Value;

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken ct = default)
    {
        try
        {
            // минимальная проверка доступности: TCP connect + /minio/health/live
            // 1) TCP
            var (host, port) = ParseEndpoint(_minio.Endpoint);
            using (var tcp = new TcpClient())
            {
                using var reg = ct.Register(() => tcp.Dispose());
                await tcp.ConnectAsync(host, port);
            }

            // 2) health endpoint minio (быстрее/надёжнее чем ListBuckets и т.п.)
            // MinIO поддерживает /minio/health/live и /minio/health/ready на API порту
            var scheme = _minio.UseSsl ? "https" : "http";
            var url = $"{scheme}://{host}:{port}/minio/health/ready";

            using var http = new HttpClient
            {
                Timeout = TimeSpan.FromSeconds(3)
            };

            using var resp = await http.GetAsync(url, ct);
            if (!resp.IsSuccessStatusCode)
                return HealthCheckResult.Unhealthy($"minio health returned {(int)resp.StatusCode}");

            return HealthCheckResult.Healthy("minio is reachable");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("minio is NOT reachable", ex);
        }
    }

    private static (string host, int port) ParseEndpoint(string endpoint)
    {
        endpoint = endpoint.Trim();
        if (!endpoint.StartsWith("http://", StringComparison.OrdinalIgnoreCase) &&
            !endpoint.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
            endpoint = "http://" + endpoint;

        var uri = new Uri(endpoint);
        var port = uri.IsDefaultPort
            ? (uri.Scheme.Equals("https", StringComparison.OrdinalIgnoreCase) ? 443 : 80)
            : uri.Port;

        return (uri.Host, port);
    }
}