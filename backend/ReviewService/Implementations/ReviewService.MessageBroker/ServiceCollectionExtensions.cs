using Confluent.Kafka;
using MassTransit;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Reviews;
using ReviewService.MessageBroker.Abstractions.Options;
using ReviewService.MessageBroker.Abstractions.Producers;
using ReviewService.MessageBroker.Producers;

namespace ReviewService.MessageBroker;

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
                rider.AddProducer<ReviewWrittenEvent>("reviews");

                rider.UsingKafka((context, k) =>
                {
                    var options = context.GetRequiredService<IOptions<KafkaOptions>>().Value;

                    k.Host(options.BootstrapServers, host =>
                    {
                        host.UseSasl(sasl =>
                        {
                            sasl.Mechanism = SaslMechanism.Plain;
                            sasl.SecurityProtocol = SecurityProtocol.SaslPlaintext;
                            sasl.Username = options.Username;
                            sasl.Password = options.Password;
                        });
                    });
                });
            });
        });

        services.AddScoped<IReviewEventsProducer, ReviewEventsProducer>();

        return services;
    }
}