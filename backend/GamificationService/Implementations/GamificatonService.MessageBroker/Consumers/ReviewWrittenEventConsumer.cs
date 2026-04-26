using GamificatonService.Core.Abstractions.Handlers;
using GamificatonService.Core.Abstractions.Observability;
using MassTransit;
using Microsoft.Extensions.Logging;
using Reviews;
using System.Diagnostics;

namespace GamificatonService.MessageBroker.Consumers;

internal sealed class ReviewWrittenEventConsumer(
    IAchievementProgressService achievementProgressService,
    IXpProgressService xpProgressService,
    ILogger<ReviewWrittenEventConsumer> logger)
    : IConsumer<ReviewWrittenEvent>
{
    public async Task Consume(ConsumeContext<ReviewWrittenEvent> context)
    {
        var stopwatch = Stopwatch.StartNew();
        var status = "success";

        try
        {
            var message = context.Message;

            var userId = Guid.Parse(message.UserId);
            var eventId = message.Meta.EventId;
            var aggregateId = message.ReviewId;
            var occurredAt = message.Meta.OccurredAt.ToDateTimeOffset();

            logger.LogInformation(
                "Consuming {MessageType} userId {UserId} reviewId {ReviewId} messageId {MessageId} correlationId {CorrelationId}",
                nameof(ReviewWrittenEvent),
                userId,
                aggregateId,
                context.MessageId,
                context.CorrelationId);

            await achievementProgressService.HandleReviewWrittenAsync(
                userId,
                context.CancellationToken);

            await xpProgressService.HandleReviewWrittenAsync(
                userId,
                eventId,
                aggregateId,
                occurredAt,
                context.CancellationToken);

            logger.LogInformation(
                "Consumed {MessageType} reviewId {ReviewId} in {ElapsedMs} ms",
                nameof(ReviewWrittenEvent),
                aggregateId,
                stopwatch.Elapsed.TotalMilliseconds);
        }
        catch (Exception exception)
        {
            status = "failed";
            GamificationMetrics.RecordOperationError("review_written_consumer", "message_broker", "exception");
            logger.LogError(
                exception,
                "Failed to consume {MessageType} messageId {MessageId} correlationId {CorrelationId}",
                nameof(ReviewWrittenEvent),
                context.MessageId,
                context.CorrelationId);
            throw;
        }
        finally
        {
            GamificationMetrics.RecordConsumerMessage("ReviewWrittenEventConsumer", "reviews-written", status);
            GamificationMetrics.RecordOperationDuration(
                "review_written_consumer",
                "message_broker",
                status,
                stopwatch.Elapsed.TotalMilliseconds);
        }
    }
}
