using System.Reflection;
using Microsoft.Extensions.DependencyInjection;
using ReviewService.CloudStorage.Abstractions.Services;

namespace ReviewService.CloudStorage.Extensions;

public static class CloudStorageInitializationExtensions
{
    private static readonly CloudIconSeedItem[] SeedItems =
    [
        new("11111111-1111-1111-1111-111111111111", "company-icons", "yandex.png",
            "ReviewService.CloudStorage.Seed.CompanyIcons.11111111-1111-1111-1111-111111111111.base64", "image/png"),

        new("22222222-2222-2222-2222-222222222222", "company-icons", "ozon.png",
            "ReviewService.CloudStorage.Seed.CompanyIcons.22222222-2222-2222-2222-222222222222.base64", "image/png"),

        new("33333333-3333-3333-3333-333333333333", "company-icons", "avito.png",
            "ReviewService.CloudStorage.Seed.CompanyIcons.33333333-3333-3333-3333-333333333333.base64", "image/png"),

        new("44444444-4444-4444-4444-444444444444", "company-icons", "tbank.png",
            "ReviewService.CloudStorage.Seed.CompanyIcons.44444444-4444-4444-4444-444444444444.base64", "image/png"),

        new("55555555-5555-5555-5555-555555555555", "company-icons", "sber.png",
            "ReviewService.CloudStorage.Seed.CompanyIcons.55555555-5555-5555-5555-555555555555.base64", "image/png"),

        new("66666666-6666-6666-6666-666666666666", "company-icons", "alfa.png",
            "ReviewService.CloudStorage.Seed.CompanyIcons.66666666-6666-6666-6666-666666666666.base64", "image/png"),

        new("77777777-7777-7777-7777-777777777777", "company-icons", "vk.png",
            "ReviewService.CloudStorage.Seed.CompanyIcons.77777777-7777-7777-7777-777777777777.base64", "image/png"),

        new("88888888-8888-8888-8888-888888888888", "company-icons", "kaspersky.png",
            "ReviewService.CloudStorage.Seed.CompanyIcons.88888888-8888-8888-8888-888888888888.base64", "image/png"),

        new("99999999-9999-9999-9999-999999999999", "company-icons", "headpoint.png",
            "ReviewService.CloudStorage.Seed.CompanyIcons.99999999-9999-9999-9999-999999999999.base64", "image/png"),

        new("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "company-icons", "t1.png",
            "ReviewService.CloudStorage.Seed.CompanyIcons.aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa.base64", "image/png"),

        new("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", "company-icons", "lamoda.png",
            "ReviewService.CloudStorage.Seed.CompanyIcons.bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb.base64", "image/png"),

        new("cccccccc-cccc-cccc-cccc-cccccccccccc", "company-icons", "wildberries.png",
            "ReviewService.CloudStorage.Seed.CompanyIcons.cccccccc-cccc-cccc-cccc-cccccccccccc.base64", "image/png"),

        new("dddddddd-dddd-dddd-dddd-dddddddddddd", "company-icons", "hh.png",
            "ReviewService.CloudStorage.Seed.CompanyIcons.dddddddd-dddd-dddd-dddd-dddddddddddd.base64", "image/png"),

        new("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee", "company-icons", "mts.png",
            "ReviewService.CloudStorage.Seed.CompanyIcons.eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee.base64", "image/png"),

        new("12121212-1212-1212-1212-121212121212", "company-icons", "2gis.png",
            "ReviewService.CloudStorage.Seed.CompanyIcons.12121212-1212-1212-1212-121212121212.base64", "image/png"),

        new("13131313-1313-1313-1313-131313131313", "company-icons", "kontur.png",
            "ReviewService.CloudStorage.Seed.CompanyIcons.13131313-1313-1313-1313-131313131313.base64", "image/png"),

        new("14141414-1414-1414-1414-141414141414", "company-icons", "x5.png",
            "ReviewService.CloudStorage.Seed.CompanyIcons.14141414-1414-1414-1414-141414141414.base64", "image/png"),

        new("15151515-1515-1515-1515-151515151515", "company-icons", "rambler.png",
            "ReviewService.CloudStorage.Seed.CompanyIcons.15151515-1515-1515-1515-151515151515.base64", "image/png"),

        new("16161616-1616-1616-1616-161616161616", "company-icons", "cian.png",
            "ReviewService.CloudStorage.Seed.CompanyIcons.16161616-1616-1616-1616-161616161616.base64", "image/png"),

        new("17171717-1717-1717-1717-171717171717", "company-icons", "surf.png",
            "ReviewService.CloudStorage.Seed.CompanyIcons.17171717-1717-1717-1717-171717171717.base64", "image/png"),
    ];

    public static async Task EnsureCloudStorageSeededAsync(
        this IServiceProvider serviceProvider,
        CancellationToken ct = default)
    {
        await using var scope = serviceProvider.CreateAsyncScope();

        var iconsStorage = scope.ServiceProvider.GetRequiredService<ICompanyIconsStorage>();

        foreach (var item in SeedItems)
        {
            ct.ThrowIfCancellationRequested();

            var base64 = await ReadEmbeddedResourceAsync(item.ResourceName, ct);
            if (string.IsNullOrWhiteSpace(base64))
                continue;

            await iconsStorage.PutIconFromBase64Async(
                iconId: item.IconId,
                base64: base64,
                contentType: item.ContentType,
                ct: ct);
        }
    }

    private static async Task<string> ReadEmbeddedResourceAsync(string resourceName, CancellationToken ct)
    {
        var assembly = Assembly.GetExecutingAssembly();

        await using var stream =
            assembly.GetManifestResourceStream(resourceName)
            ?? throw new InvalidOperationException(
                $"Embedded resource '{resourceName}' was not found.");

        using var reader = new StreamReader(stream);
        return await reader.ReadToEndAsync(ct);
    }

    private sealed record CloudIconSeedItem(
        string IconIdString,
        string Bucket,
        string FileName,
        string ResourceName,
        string ContentType)
    {
        public Guid IconId => Guid.Parse(IconIdString);
    }
}