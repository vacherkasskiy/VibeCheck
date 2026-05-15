using Common;
using Confluent.Kafka;
using Google.Protobuf;
using Reviews;
using ReviewService.Core.Abstractions.Observability;
using ReviewService.MessageBroker.Abstractions.Producers;
using System.Diagnostics;
using ProtobufTimestamp = Google.Protobuf.WellKnownTypes.Timestamp;

namespace ReviewService.MessageBroker.Producers;

internal sealed class ReviewLikesEventsProducer(
    IProducer<string, byte[]> producer) : IReviewLikesEventsProducer
{
    private const string ReviewsLikedTopic = "reviews-liked";

    public async Task PublishReviewLikedAsync(
        Guid likedByUserId,
        Guid reviewId,
        Guid reviewAuthorId,
        Guid reviewCompanyId,
        string reviewCompanyName,
        string voteMode,
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
                    EventType = voteMode == "like" ? "review.liked" : "review.disliked",
                    AggregateId = reviewId.ToString(),
                    PayloadVersion = 1,
                    OccurredAt = ProtobufTimestamp.FromDateTime(createdAt.UtcDateTime),
                    Source = SourceType.ReviewService
                },
                ReviewId = reviewId.ToString(),
                ReviewAuthorId = reviewAuthorId.ToString(),
                ReviewCompanyId = reviewCompanyId.ToString(),
                ReviewCompanyName = reviewCompanyName,
                LikedAt = ProtobufTimestamp.FromDateTime(createdAt.UtcDateTime),
                LikedByUserId = likedByUserId.ToString(),
                VoteMode = voteMode
            };

            await producer.ProduceAsync(
                ReviewsLikedTopic,
                new Message<string, byte[]>
                {
                    Key = message.LikedByUserId,
                    Value = message.ToByteArray()
                },
                ct);
        }
        catch
        {
            status = "failed";
            ReviewMetrics.RecordOperationError("publish_review_liked", "message_broker", "exception");
            throw;
        }
        finally
        {
            ReviewMetrics.RecordProducedMessage(
                "ReviewLikesEventsProducer",
                ReviewsLikedTopic,
                voteMode == "like" ? "review.liked" : "review.disliked",
                status);
            ReviewMetrics.RecordOperationDuration("publish_review_liked", "message_broker", status, stopwatch.Elapsed.TotalMilliseconds);
        }
    }
}
