namespace ReviewService.MessageBroker.Abstractions.Producers;

public interface IReportEventsProducer
{
    Task PublishReviewReportedAsync(
        Guid reportId,
        Guid reviewId,
        Guid reporterId,
        int reasonType,
        string? reasonText,
        DateTimeOffset createdAt,
        CancellationToken ct);
}