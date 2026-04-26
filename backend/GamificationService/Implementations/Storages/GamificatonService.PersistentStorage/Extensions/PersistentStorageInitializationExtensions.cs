using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace GamificatonService.PersistentStorage.Extensions;

public static class PersistentStorageInitializationExtensions
{
    private static readonly string[] SeedResourceNames =
    [
        "GamificatonService.PersistentStorage.Seed.001_achievement_icons.sql",
        "GamificatonService.PersistentStorage.Seed.002_achievements.sql",
        "GamificatonService.PersistentStorage.Seed.003_level_thresholds.sql",
        "GamificatonService.PersistentStorage.Seed.004_user_levels.sql",
        "GamificatonService.PersistentStorage.Seed.005_user_achievements.sql",
        "GamificatonService.PersistentStorage.Seed.006_user_xp_rewards.sql",
    ];

    public static async Task ApplyPersistentStorageMigrationsAndSeedAsync(
        this IServiceProvider serviceProvider,
        CancellationToken ct = default)
    {
        await using var scope = serviceProvider.CreateAsyncScope();

        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        await dbContext.Database.MigrateAsync(ct);

        foreach (var resourceName in SeedResourceNames)
        {
            var sql = await ReadEmbeddedResourceAsync(resourceName, ct);
            if (string.IsNullOrWhiteSpace(sql))
                continue;

            await dbContext.Database.ExecuteSqlRawAsync(sql, ct);
        }
    }

    private static async Task<string> ReadEmbeddedResourceAsync(string resourceName, CancellationToken ct)
    {
        var assembly = typeof(PersistentStorageInitializationExtensions).Assembly;

        await using var stream =
            assembly.GetManifestResourceStream(resourceName)
            ?? throw new InvalidOperationException(
                $"Embedded resource '{resourceName}' was not found. " +
                $"Check csproj EmbeddedResource include and resource name.");

        using var reader = new StreamReader(stream);
        return await reader.ReadToEndAsync(ct);
    }
}