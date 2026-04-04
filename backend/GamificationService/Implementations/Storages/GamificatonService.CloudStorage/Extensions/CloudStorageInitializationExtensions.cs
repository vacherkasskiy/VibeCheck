using System.Reflection;
using GamificatonService.CloudStorage.Abstractions.Services;
using Microsoft.Extensions.DependencyInjection;

namespace GamificatonService.CloudStorage.Extensions;

public static class CloudStorageInitializationExtensions
{
    private static readonly CloudIconSeedItem[] SeedItems =
    [
        // 0001 добро пожаловать в вайб!
        new("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001", "achievement-icons", "welcome_to_vibe.png",
            "GamificatonService.CloudStorage.Seed.AchievementsIcons.aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001.base64",
            "image/png"),

        // 0002 проба пера
        new("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002", "achievement-icons", "pen_sample.png",
            "GamificatonService.CloudStorage.Seed.AchievementsIcons.aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002.base64",
            "image/png"),

        // 0003 обновил впечатления
        new("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0003", "achievement-icons", "updated_memories.png",
            "GamificatonService.CloudStorage.Seed.AchievementsIcons.aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0003.base64",
            "image/png"),

        // 0004 опытный обозреватель
        new("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0004", "achievement-icons", "senior_critic.png",
            "GamificatonService.CloudStorage.Seed.AchievementsIcons.aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0004.base64",
            "image/png"),

        // 0005 голос сообщества
        new("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0005", "achievement-icons", "voice_of_crowd.png",
            "GamificatonService.CloudStorage.Seed.AchievementsIcons.aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0005.base64",
            "image/png"),

        // 0006 первое впечатление
        new("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0006", "achievement-icons", "first_impression.png",
            "GamificatonService.CloudStorage.Seed.AchievementsIcons.aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0006.base64",
            "image/png"),

        // 0007 активный судья
        new("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0007", "achievement-icons", "active_judge.png",
            "GamificatonService.CloudStorage.Seed.AchievementsIcons.aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0007.base64",
            "image/png"),

        // 0008 виброаналитик
        new("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0008", "achievement-icons", "vibe_analysist.png",
            "GamificatonService.CloudStorage.Seed.AchievementsIcons.aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0008.base64",
            "image/png"),

        // 0009 настоящий модератор вайба
        new("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0009", "achievement-icons", "true_vibe_moderator.png",
            "GamificatonService.CloudStorage.Seed.AchievementsIcons.aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0009.base64",
            "image/png"),

        // 0010 вайб-следопыт
        new("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0010", "achievement-icons", "vibe_hunter.png",
            "GamificatonService.CloudStorage.Seed.AchievementsIcons.aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0010.base64",
            "image/png"),

        // 0011 любопытный наблюдатель
        new("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0011", "achievement-icons", "curious_spectator.png",
            "GamificatonService.CloudStorage.Seed.AchievementsIcons.aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0011.base64",
            "image/png"),

        // 0012 коллекционер вайбов
        new("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0012", "achievement-icons", "vibe_collector.png",
            "GamificatonService.CloudStorage.Seed.AchievementsIcons.aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0012.base64",
            "image/png"),

        // 0013 поддержи вайб
        new("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0013", "achievement-icons", "support_vibe.png",
            "GamificatonService.CloudStorage.Seed.AchievementsIcons.aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0013.base64",
            "image/png"),

        // 0014 верный вайбу
        new("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0014", "achievement-icons", "loyal_to_vibe.png",
            "GamificatonService.CloudStorage.Seed.AchievementsIcons.aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0014.base64",
            "image/png"),

        // 0015 перестроил вайб-компас
        new("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0015", "achievement-icons", "rerouted_vibe_compas.png",
            "GamificatonService.CloudStorage.Seed.AchievementsIcons.aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0015.base64",
            "image/png"),

        // 0016 первая реакция
        new("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0016", "achievement-icons", "first_reaction.png",
            "GamificatonService.CloudStorage.Seed.AchievementsIcons.aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0016.base64",
            "image/png"),

        // 0017 популярный автор
        new("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0017", "achievement-icons", "popular_author.png",
            "GamificatonService.CloudStorage.Seed.AchievementsIcons.aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0017.base64",
            "image/png"),

        // 0018 легенда вайба
        new("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0018", "achievement-icons", "vibe_legend.png",
            "GamificatonService.CloudStorage.Seed.AchievementsIcons.aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0018.base64",
            "image/png"),

        // 0019 первый фанат
        new("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0019", "achievement-icons", "first_fan.png",
            "GamificatonService.CloudStorage.Seed.AchievementsIcons.aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0019.base64",
            "image/png"),

        // 0020 вайб-влиятель
        new("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0020", "achievement-icons", "vibe_influencer.png",
            "GamificatonService.CloudStorage.Seed.AchievementsIcons.aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0020.base64",
            "image/png"),

        // 0021 инфлюенсер вайба
        new("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0021", "achievement-icons", "100_vibe_influencer.png",
            "GamificatonService.CloudStorage.Seed.AchievementsIcons.aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0021.base64",
            "image/png"),

        // 0022 инициатор
        new("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0022", "achievement-icons", "initiator.png",
            "GamificatonService.CloudStorage.Seed.AchievementsIcons.aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0022.base64",
            "image/png"),

        // 0023 обратная связь
        new("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0023", "achievement-icons", "feedback.png",
            "GamificatonService.CloudStorage.Seed.AchievementsIcons.aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0023.base64",
            "image/png"),
    ];

    public static async Task EnsureCloudStorageSeededAsync(
        this IServiceProvider serviceProvider,
        CancellationToken ct = default)
    {
        await using var scope = serviceProvider.CreateAsyncScope();

        var iconsStorage = scope.ServiceProvider.GetRequiredService<IAchievementsIconsStorage>();

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