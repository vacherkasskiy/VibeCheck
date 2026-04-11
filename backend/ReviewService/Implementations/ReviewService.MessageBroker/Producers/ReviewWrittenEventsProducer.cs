using Common;
using Google.Protobuf.WellKnownTypes;
using MassTransit;
using Reviews;
using ReviewService.MessageBroker.Abstractions.Producers;

namespace ReviewService.MessageBroker.Producers;

internal sealed class ReviewWrittenEventsProducer(
    ITopicProducer<ReviewWrittenEvent> producer)
    : IReviewEventsProducer
{
    public async Task PublishReviewWrittenAsync(
        Guid reviewId,
        Guid userId,
        DateTimeOffset createdAt,
        CancellationToken ct)
    {
        var message = new ReviewWrittenEvent
        {
            Meta = new EventMetadata
            {
                EventId = Guid.NewGuid().ToString(),
                EventType = "review.written",
                AggregateId = reviewId.ToString(),
                PayloadVersion = 1,
                OccurredAt = Timestamp.FromDateTime(createdAt.UtcDateTime),
                Source = SourceType.ReviewService
            },
            ReviewId = reviewId.ToString(),
            UserId = userId.ToString(),
            CreatedAt = Timestamp.FromDateTime(createdAt.UtcDateTime)
        };

        await producer.Produce(message, ct);
    }
}