using Confluent.Kafka;
using GamificatonService.MessageBroker.Abstractions.Producers;
using Microsoft.Extensions.DependencyInjection;
using GamificatonService.MessageBroker.Producers;
using GamificatonService.MessageBroker.Abstractions.Options;
using Microsoft.Extensions.Options;

namespace GamificatonService.MessageBroker;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddProducerServices(this IServiceCollection services)
    {
        services.AddSingleton<IProducer<string, byte[]>>(sp =>
        {
            var options = sp.GetRequiredService<IOptions<KafkaOptions>>().Value;
            return new ProducerBuilder<string, byte[]>(KafkaClientConfigFactory.CreateProducerConfig(options))
                .SetKeySerializer(Serializers.Utf8)
                .SetValueSerializer(Serializers.ByteArray)
                .Build();
        });

        services.AddScoped<IAchievementEventsProducer, AchievementEventsProducer>();
        services.AddScoped<IUserLevelUpEventsProducer, UserLevelUpEventsProducer>();

        return services;
    }
}
