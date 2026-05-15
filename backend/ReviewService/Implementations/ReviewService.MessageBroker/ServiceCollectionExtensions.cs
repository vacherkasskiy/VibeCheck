using Confluent.Kafka;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using ReviewService.MessageBroker.Consumers;
using ReviewService.MessageBroker.Abstractions.Options;
using ReviewService.MessageBroker.Abstractions.Producers;
using ReviewService.MessageBroker.Producers;

namespace ReviewService.MessageBroker;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddMessageBrokerServices(this IServiceCollection services)
    {
        services.AddSingleton<IProducer<string, byte[]>>(sp =>
        {
            var options = sp.GetRequiredService<IOptions<KafkaOptions>>().Value;
            return new ProducerBuilder<string, byte[]>(KafkaClientConfigFactory.CreateProducerConfig(options))
                .SetKeySerializer(Serializers.Utf8)
                .SetValueSerializer(Serializers.ByteArray)
                .Build();
        });

        services.AddHostedService<UserProfileUpdatedEventConsumer>();

        services.AddScoped<IReviewEventsProducer, ReviewWrittenEventsProducer>();
        services.AddScoped<IReviewLikesEventsProducer, ReviewLikesEventsProducer>();
        services.AddScoped<IReportEventsProducer, ReportEventsProducer>();

        return services;
    }
}
