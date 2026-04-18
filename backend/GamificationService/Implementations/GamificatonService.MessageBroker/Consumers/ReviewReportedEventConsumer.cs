using GamificatonService.Core.Abstractions.Handlers;
using GamificatonService.Core.Abstractions.Observability;
using MassTransit;
using Reports;
using System.Diagnostics;

namespace GamificatonService.MessageBroker.Consumers;

internal sealed class ReviewReportedEventConsumer(
    IAchievementProgressService achievementProgressService)
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

            await achievementProgressService.HandleReviewReportedAsync(
                userId,
                context.CancellationToken);
        }
        catch
        {
            status = "failed";
            GamificationMetrics.RecordOperationError("review_reported_consumer", "message_broker", "exception");
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
