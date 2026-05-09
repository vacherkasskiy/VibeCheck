using GamificationService.Gateway.Kafka.Consumers;
using GamificatonService.MessageBroker;
using GamificatonService.MessageBroker.Abstractions.Options;
using MassTransit;
using Microsoft.Extensions.Options;
using Reports;
using Reviews;
using Subscriptions;

namespace GamificationService.Gateway.Kafka.Configurations;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddConsumerServices(this IServiceCollection services)
    {
        services.AddOptions<MassTransitHostOptions>().Configure(options =>
        {
            options.WaitUntilStarted = true;
        });

        services.AddMassTransit(x =>
        {
            x.UsingInMemory((context, cfg) =>
            {
                cfg.ConfigureEndpoints(context);
            });

            x.AddRider(rider =>
            {
                rider.AddProducersToRider();
                
                rider.AddConsumer<ReviewWrittenEventConsumer>();
                rider.AddConsumer<ReviewUpdatedEventConsumer>();
                rider.AddConsumer<ReviewLikedEventConsumer>();
                rider.AddConsumer<ReviewReportedEventConsumer>();
                rider.AddConsumer<UserSubscribedEventConsumer>();

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
                        "reviews-written",
                        "gamification-reviews-written-consumers",
                        e =>
                        {
                            e.ConfigureConsumer<ReviewWrittenEventConsumer>(context);
                        }
                    );

                    k.TopicEndpoint<ReviewUpdatedEvent>(
                        "reviews-updated",
                        "gamification-reviews-updated-consumers",
                        e =>
                        {
                            e.ConfigureConsumer<ReviewUpdatedEventConsumer>(context);
                        }
                    );

                    k.TopicEndpoint<ReviewLikedEvent>(
                        "reviews-liked",
                        "gamification-reviews-liked-consumers",
                        e =>
                        {
                            e.ConfigureConsumer<ReviewLikedEventConsumer>(context);
                        }
                    );

                    k.TopicEndpoint<ReviewReportedEvent>(
                        "reports",
                        "gamification-reports-consumers",
                        e =>
                        {
                            e.ConfigureConsumer<ReviewReportedEventConsumer>(context);
                        }
                    );

                    k.TopicEndpoint<UserSubscribedEvent>(
                        "subscriptions",
                        "gamification-subscriptions-consumers",
                        e =>
                        {
                            e.ConfigureConsumer<UserSubscribedEventConsumer>(context);
                        }
                    );
                });
            });
        });

        return services;
    }
}
