namespace ReviewService.MessageBroker.Abstractions.Producers;

public interface IReviewEventsProducer
{
    Task PublishReviewWrittenAsync(
        Guid reviewId,
        Guid userId,
        DateTimeOffset createdAt,
        CancellationToken ct);
}