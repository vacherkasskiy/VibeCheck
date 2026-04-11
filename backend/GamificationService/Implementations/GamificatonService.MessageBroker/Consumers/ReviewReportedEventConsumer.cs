using MassTransit;
using Reports;

namespace GamificatonService.MessageBroker.Consumers;

internal sealed class ReviewReportedEventConsumer : IConsumer<ReviewReportedEvent>
{
    public Task Consume(ConsumeContext<ReviewReportedEvent> context)
    {
        var message = context.Message;
        

        return Task.CompletedTask;
    }
}