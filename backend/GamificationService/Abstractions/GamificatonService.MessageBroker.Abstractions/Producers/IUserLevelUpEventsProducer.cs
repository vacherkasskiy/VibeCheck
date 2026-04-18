namespace GamificatonService.MessageBroker.Abstractions.Producers;

public interface IUserLevelUpEventsProducer
{
    Task PublishUserLevelUpAsync(
        Guid userId,
        int newLevel,
        DateTimeOffset occurredAt,
        CancellationToken ct);
}