using GamificationService.Gateway.Kafka.Consumers;
using Google.Protobuf;
using Reports;
using Reviews;
using Subscriptions;

namespace GamificationService.Gateway.Kafka.Configurations;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddConsumerServices(this IServiceCollection services)
    {
        services.AddScoped<IKafkaEventHandler<ReviewWrittenEvent>, ReviewWrittenEventConsumer>();
        services.AddScoped<IKafkaEventHandler<ReviewUpdatedEvent>, ReviewUpdatedEventConsumer>();
        services.AddScoped<IKafkaEventHandler<ReviewLikedEvent>, ReviewLikedEventConsumer>();
        services.AddScoped<IKafkaEventHandler<ReviewReportedEvent>, ReviewReportedEventConsumer>();
        services.AddScoped<IKafkaEventHandler<UserSubscribedEvent>, UserSubscribedEventConsumer>();

        services.AddKafkaConsumer(
            "reviews-written",
            "gamification-reviews-written-consumers",
            ReviewWrittenEvent.Parser);

        services.AddKafkaConsumer(
            "reviews-updated",
            "gamification-reviews-updated-consumers",
            ReviewUpdatedEvent.Parser);

        services.AddKafkaConsumer(
            "reviews-liked",
            "gamification-reviews-liked-consumers",
            ReviewLikedEvent.Parser);

        services.AddKafkaConsumer(
            "reports",
            "gamification-reports-consumers",
            ReviewReportedEvent.Parser);

        services.AddKafkaConsumer(
            "subscriptions",
            "gamification-subscriptions-consumers",
            UserSubscribedEvent.Parser);

        return services;
    }

    private static IServiceCollection AddKafkaConsumer<TEvent>(
        this IServiceCollection services,
        string topic,
        string groupId,
        MessageParser<TEvent> parser)
        where TEvent : class, IMessage<TEvent>
    {
        services.AddHostedService(sp =>
            ActivatorUtilities.CreateInstance<KafkaTopicConsumerHostedService<TEvent>>(
                sp,
                topic,
                groupId,
                parser));

        return services;
    }
}
