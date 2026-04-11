using MassTransit;
using Reviews;

namespace GamificatonService.MessageBroker.Consumers;

internal sealed class ReviewWrittenEventConsumer : IConsumer<ReviewWrittenEvent>
{
    public Task Consume(ConsumeContext<ReviewWrittenEvent> context)
    {
        var message = context.Message;

        Console.WriteLine(
            $"[reviews] ReviewWrittenEvent received: " +
            $"review_id={message.ReviewId}, " +
            $"user_id={message.UserId}, " +
            $"created_at={message.CreatedAt}");

        return Task.CompletedTask;
    }
}