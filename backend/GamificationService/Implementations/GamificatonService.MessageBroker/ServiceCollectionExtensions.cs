using GamificatonService.MessageBroker.Abstractions.Options;
using GamificatonService.MessageBroker.Consumers;
using MassTransit;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Reviews;

namespace GamificatonService.MessageBroker;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddMessageBrokerServices(this IServiceCollection services)
    {
        services.AddMassTransit(x =>
        {
            x.UsingInMemory((context, cfg) =>
            {
                cfg.ConfigureEndpoints(context);
            });

            x.AddRider(rider =>
            {
                rider.AddConsumer<ReviewWrittenEventConsumer>();

                rider.UsingKafka((context, k) =>
                {
                    var options = context.GetRequiredService<IOptions<KafkaOptions>>().Value;

                    k.Host(options.BootstrapServers, host =>
                    {
                        host.UseSasl(sasl =>
                        {
                            sasl.Mechanism = Confluent.Kafka.SaslMechanism.Plain;
                            sasl.SecurityProtocol = Confluent.Kafka.SecurityProtocol.SaslPlaintext;
                            sasl.Username = options.Username;
                            sasl.Password = options.Password;
                        });
                    });

                    k.TopicEndpoint<ReviewWrittenEvent>(
                        "reviews",
                        "gamification-review-written-consumers",
                        e =>
                        {
                            e.ConfigureConsumer<ReviewWrittenEventConsumer>(context);
                        });
                });
            });
        });

        return services;
    }
}