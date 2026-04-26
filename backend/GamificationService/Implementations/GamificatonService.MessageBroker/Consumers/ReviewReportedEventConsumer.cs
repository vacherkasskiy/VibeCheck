using GamificatonService.Core.Abstractions.Handlers;
using GamificatonService.Core.Abstractions.Observability;
using MassTransit;
using Microsoft.Extensions.Logging;
using Reports;
using System.Diagnostics;

namespace GamificatonService.MessageBroker.Consumers;

internal sealed class ReviewReportedEventConsumer(
    IAchievementProgressService achievementProgressService,
    ILogger<ReviewReportedEventConsumer> logger)
    : IConsumer<ReviewReportedEvent>
{
    public async Task Consume(ConsumeContext<ReviewReportedEvent> context)
    {
        var stopwatch = Stopwatch.StartNew();
        var status = "success";

        try
        {
            var message = context.Message;

            var userId = Guid.Parse(message.ReporterUserId);

            logger.LogInformation(
                "Consuming {MessageType} reporterUserId {ReporterUserId} reviewId {ReviewId} messageId {MessageId} correlationId {CorrelationId}",
                nameof(ReviewReportedEvent),
                userId,
                message.ReviewId,
                context.MessageId,
                context.CorrelationId);

            await achievementProgressService.HandleReviewReportedAsync(
                userId,
                context.CancellationToken);

            logger.LogInformation(
                "Consumed {MessageType} reviewId {ReviewId} in {ElapsedMs} ms",
                nameof(ReviewReportedEvent),
                message.ReviewId,
                stopwatch.Elapsed.TotalMilliseconds);
        }
        catch (Exception exception)
        {
            status = "failed";
            GamificationMetrics.RecordOperationError("review_reported_consumer", "message_broker", "exception");
            logger.LogError(
                exception,
                "Failed to consume {MessageType} messageId {MessageId} correlationId {CorrelationId}",
                nameof(ReviewReportedEvent),
                context.MessageId,
                context.CorrelationId);
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
