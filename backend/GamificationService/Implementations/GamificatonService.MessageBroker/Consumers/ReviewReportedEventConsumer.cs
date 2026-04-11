using GamificatonService.Core.Abstractions.Handlers;
using MassTransit;
using Reports;

namespace GamificatonService.MessageBroker.Consumers;

internal sealed class ReviewReportedEventConsumer(
    IAchievementProgressService achievementProgressService)
    : IConsumer<ReviewReportedEvent>
{
    public async Task Consume(ConsumeContext<ReviewReportedEvent> context)
    {
        var message = context.Message;

        var userId = Guid.Parse(message.ReporterUserId);

        await achievementProgressService.HandleReviewReportedAsync(
            userId,
            context.CancellationToken);
    }
}