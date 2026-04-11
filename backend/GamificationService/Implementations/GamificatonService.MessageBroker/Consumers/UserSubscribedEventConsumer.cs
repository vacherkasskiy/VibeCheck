using MassTransit;
using Reviews;
using Subscriptions;

namespace GamificatonService.MessageBroker.Consumers;

internal sealed class UserSubscribedEventConsumer : IConsumer<UserSubscribedEvent>
{
    public Task Consume(ConsumeContext<UserSubscribedEvent> context)
    {
        var message = context.Message;

        

        return Task.CompletedTask;
    }
}