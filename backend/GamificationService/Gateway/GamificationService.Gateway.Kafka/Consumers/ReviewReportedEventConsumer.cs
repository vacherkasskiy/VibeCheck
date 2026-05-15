using System.Diagnostics;
using GamificatonService.Core.Abstractions.Handlers;
using GamificatonService.Core.Abstractions.Observability;
using Microsoft.Extensions.Logging;
using Reports;

namespace GamificationService.Gateway.Kafka.Consumers;

internal sealed class ReviewReportedEventConsumer(
    IAchievementProgressService achievementProgressService,
    ILogger<ReviewReportedEventConsumer> logger)
    : IKafkaEventHandler<ReviewReportedEvent>
{
    public async Task HandleAsync(
        ReviewReportedEvent message,
        KafkaConsumedMessageMetadata metadata,
        CancellationToken ct)
    {
        var stopwatch = Stopwatch.StartNew();
        var status = "success";

        try
        {
            var userId = Guid.Parse(message.ReporterUserId);

            logger.LogInformation(
                "Consuming {MessageType} reporterUserId {ReporterUserId} reviewId {ReviewId} topic {Topic} partition {Partition} offset {Offset}",
                nameof(ReviewReportedEvent),
                userId,
                message.ReviewId,
                metadata.Topic,
                metadata.Partition,
                metadata.Offset);

            await achievementProgressService.HandleReviewReportedAsync(
                userId,
                ct);

            logger.LogInformation(
                "Consumed {MessageType} reviewId {ReviewId} topic {Topic} partition {Partition} offset {Offset} in {ElapsedMs} ms",
                nameof(ReviewReportedEvent),
                message.ReviewId,
                metadata.Topic,
                metadata.Partition,
                metadata.Offset,
                stopwatch.Elapsed.TotalMilliseconds);
        }
        catch (Exception exception)
        {
            status = "failed";
            GamificationMetrics.RecordOperationError("review_reported_consumer", "message_broker", "exception");
            logger.LogError(
                exception,
                "Failed to consume {MessageType} topic {Topic} partition {Partition} offset {Offset}",
                nameof(ReviewReportedEvent),
                metadata.Topic,
                metadata.Partition,
                metadata.Offset);
            throw;
        }
        finally
        {
            GamificationMetrics.RecordConsumerMessage("ReviewReportedEventConsumer", "reports", status);
            GamificationMetrics.RecordOperationDuration(
                "review_reported_consumer",
                "message_broker",
                status,
                stopwatch.Elapsed.TotalMilliseconds);
        }
    }
}
