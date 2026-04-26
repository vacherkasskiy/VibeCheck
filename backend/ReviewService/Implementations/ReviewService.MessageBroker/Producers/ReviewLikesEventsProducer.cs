using Common;
using Google.Protobuf.WellKnownTypes;
using MassTransit;
using Reviews;
using ReviewService.Core.Abstractions.Observability;
using ReviewService.MessageBroker.Abstractions.Producers;
using System.Diagnostics;

namespace ReviewService.MessageBroker.Producers;

internal sealed class ReviewLikesEventsProducer(
    ITopicProducer<ReviewLikedEvent> producer) : IReviewLikesEventsProducer
{
    public async Task PublishReviewLikedAsync(
        Guid likedByUserId,
        Guid reviewId,
        Guid reviewAuthorId,
        Guid reviewCompanyId,
        string reviewCompanyName,
        DateTimeOffset createdAt,
        CancellationToken ct)
    {
        var stopwatch = Stopwatch.StartNew();
        var status = "success";

        try
        {
            var message = new ReviewLikedEvent
            {
                Meta = new EventMetadata
                {
                    EventId = Guid.NewGuid()
                        .ToString(),
                    EventType = "review.liked",
                    AggregateId = reviewId.ToString(),
                    PayloadVersion = 1,
                    OccurredAt = Timestamp.FromDateTime(createdAt.UtcDateTime),
                    Source = SourceType.ReviewService
                },
                ReviewId = reviewId.ToString(),
                ReviewAuthorId = reviewAuthorId.ToString(),
                ReviewCompanyId = reviewCompanyId.ToString(),
                ReviewCompanyName = reviewCompanyName,
                LikedAt = Timestamp.FromDateTime(createdAt.UtcDateTime),
                LikedByUserId = likedByUserId.ToString(),
            };

            await producer.Produce(message, ct);
        }
        catch
        {
            status = "failed";
            ReviewMetrics.RecordOperationError("publish_review_liked", "message_broker", "exception");
            throw;
        }
        finally
        {
            ReviewMetrics.RecordProducedMessage("ReviewLikesEventsProducer", "reviews-liked", "review.liked", status);
            ReviewMetrics.RecordOperationDuration("publish_review_liked", "message_broker", status, stopwatch.Elapsed.TotalMilliseconds);
        }
    }
}
