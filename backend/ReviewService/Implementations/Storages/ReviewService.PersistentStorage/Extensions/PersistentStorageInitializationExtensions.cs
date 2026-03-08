using System.Reflection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace ReviewService.PersistentStorage.Extensions;

public static class PersistentStorageInitializationExtensions
{
    private static readonly string[] SeedResourceNames =
    [
        "ReviewService.PersistentStorage.Seed.001_flags.sql",
        "ReviewService.PersistentStorage.Seed.002_companies.sql",
        "ReviewService.PersistentStorage.Seed.003_company_flags.sql",
        "ReviewService.PersistentStorage.Seed.004_user_profiles.sql",
        "ReviewService.PersistentStorage.Seed.005_company_requests.sql",
        "ReviewService.PersistentStorage.Seed.006_reviews.sql",
        "ReviewService.PersistentStorage.Seed.007_review_flags.sql",
        "ReviewService.PersistentStorage.Seed.008_review_votes.sql",
        "ReviewService.PersistentStorage.Seed.009_review_reports.sql"
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
        var assembly = Assembly.GetExecutingAssembly();

        await using var stream = assembly.GetManifestResourceStream(resourceName)
                                 ?? throw new InvalidOperationException($"Embedded resource '{resourceName}' was not found.");

        using var reader = new StreamReader(stream);
        return await reader.ReadToEndAsync(ct);
    }
}