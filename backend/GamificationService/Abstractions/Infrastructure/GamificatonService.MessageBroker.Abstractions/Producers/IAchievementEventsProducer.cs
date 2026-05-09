namespace GamificatonService.MessageBroker.Abstractions.Producers;

public interface IAchievementEventsProducer
{
    Task PublishAchievementGrantedAsync(
        Guid userId,
        string achievementName,
        DateTimeOffset grantedAt,
        CancellationToken ct);
}