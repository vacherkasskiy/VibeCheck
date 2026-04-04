using System.Text.RegularExpressions;
using GamificatonService.CloudStorage.Abstractions.Options;
using GamificatonService.CloudStorage.Abstractions.Services;
using Microsoft.Extensions.Options;
using Minio;
using Minio.DataModel.Args;

namespace GamificatonService.CloudStorage.Services;

public sealed class AchievementsIconsStorage : IAchievementsIconsStorage
{
    private readonly IMinioClient _client;
    private readonly MinioOptions _options;

    private const int DefaultPresignExpirySeconds = 60 * 60 * 24;

    public AchievementsIconsStorage(IOptions<MinioOptions> options)
    {
        _options = options.Value;

        var endpoint = NormalizeEndpoint(_options.Endpoint);

        _client = new MinioClient()
            .WithEndpoint(endpoint.host, endpoint.port)
            .WithCredentials(_options.AccessKey, _options.SecretKey)
            .WithSSL(_options.UseSsl)
            .Build();
    }

    public async Task<IReadOnlyDictionary<Guid, string>> GetIconReadUrlsAsync(
        IReadOnlyCollection<Guid> iconIds,
        CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();

        if (iconIds is null)
            throw new ArgumentNullException(nameof(iconIds));

        // чистим мусор + убираем дубликаты
        var unique = iconIds
            .Where(x => x != Guid.Empty)
            .Distinct()
            .ToArray();

        if (unique.Length == 0)
            return new Dictionary<Guid, string>();

        // minio клиент не даёт "presign batch" одной командой,
        // поэтому делаем параллельно, но ограничиваем степень параллелизма.
        const int maxConcurrency = 8;

        var results = new Dictionary<Guid, string>(unique.Length);
        using var throttler = new SemaphoreSlim(maxConcurrency, maxConcurrency);

        var tasks = unique.Select(async iconId =>
        {
            await throttler.WaitAsync(ct);
            try
            {
                var args = new PresignedGetObjectArgs()
                    .WithBucket(_options.Bucket)
                    .WithObject(BuildObjectKey(iconId))
                    .WithExpiry(DefaultPresignExpirySeconds);

                var url = await _client.PresignedGetObjectAsync(args);

                lock (results)
                    results[iconId] = url;
            }
            finally
            {
                throttler.Release();
            }
        });

        await Task.WhenAll(tasks);

        return results;
    }

    public async Task PutIconFromBase64Async(
        Guid iconId,
        string base64,
        string contentType,
        CancellationToken ct)
    {
        if (iconId == Guid.Empty)
            throw new ArgumentException("iconId is empty", nameof(iconId));

        if (string.IsNullOrWhiteSpace(base64))
            throw new ArgumentException("base64 is empty", nameof(base64));

        if (string.IsNullOrWhiteSpace(contentType))
            throw new ArgumentException("contentType is empty", nameof(contentType));

        var bytes = DecodeBase64(base64);

        await using var ms = new MemoryStream(bytes);

        var putArgs = new PutObjectArgs()
            .WithBucket(_options.Bucket)
            .WithObject(BuildObjectKey(iconId))
            .WithStreamData(ms)
            .WithObjectSize(ms.Length)
            .WithContentType(contentType);

        await _client.PutObjectAsync(putArgs, ct);
    }

    private static string BuildObjectKey(Guid iconId)
        => $"achievements-icons/{iconId}.png";

    private static (string host, int port) NormalizeEndpoint(string endpoint)
    {
        endpoint = endpoint.Trim();

        if (!endpoint.StartsWith("http://", StringComparison.OrdinalIgnoreCase) &&
            !endpoint.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
        {
            endpoint = "http://" + endpoint;
        }

        var uri = new Uri(endpoint);
        var port = uri.IsDefaultPort
            ? (uri.Scheme.Equals("https", StringComparison.OrdinalIgnoreCase) ? 443 : 80)
            : uri.Port;

        return (uri.Host, port);
    }

    private static byte[] DecodeBase64(string base64)
    {
        var match = Regex.Match(base64, @"^data:.*?;base64,(?<data>.+)$", RegexOptions.IgnoreCase);
        if (match.Success)
            base64 = match.Groups["data"].Value;

        return Convert.FromBase64String(base64);
    }
}