using GamificatonService.Core.Abstractions.Handlers;
using GamificatonService.Core.Abstractions.Observability;
using MassTransit;
using Reviews;
using System.Diagnostics;

namespace GamificatonService.MessageBroker.Consumers;

internal sealed class ReviewWrittenEventConsumer(
    IAchievementProgressService achievementProgressService,
    IXpProgressService xpProgressService)
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

            await achievementProgressService.HandleReviewWrittenAsync(
                userId,
                context.CancellationToken);

            await xpProgressService.HandleReviewWrittenAsync(
                userId,
                eventId,
                aggregateId,
                occurredAt,
                context.CancellationToken);
        }
        catch
        {
            status = "failed";
            GamificationMetrics.RecordOperationError("review_written_consumer", "message_broker", "exception");
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
