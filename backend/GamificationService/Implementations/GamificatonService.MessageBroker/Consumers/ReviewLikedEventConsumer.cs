using MassTransit;
using Reviews;

namespace GamificatonService.MessageBroker.Consumers;

internal sealed class ReviewLikedEventConsumer : IConsumer<ReviewLikedEvent>
{
    public Task Consume(ConsumeContext<ReviewLikedEvent> context)
    {
        var message = context.Message;
        

        return Task.CompletedTask;
    }
}