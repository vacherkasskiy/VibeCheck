using GamificatonService.MessageBroker.Abstractions.Options;
using GamificatonService.MessageBroker.Consumers;
using MassTransit;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Reviews;
using Achievements;
using GamificatonService.MessageBroker.Abstractions.Producers;
using GamificatonService.MessageBroker.Producers;
using Reports;
using Subscriptions;

namespace GamificatonService.MessageBroker;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddMessageBrokerServices(this IServiceCollection services)
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
                rider.AddConsumer<ReviewWrittenEventConsumer>();
                rider.AddConsumer<ReviewLikedEventConsumer>();
                rider.AddConsumer<ReviewReportedEventConsumer>();
                rider.AddConsumer<UserSubscribedEventConsumer>();

                rider.AddProducer<AchievementGrantedEvent>("gamification-achievement");
                rider.AddProducer<UserLevelUpEvent>("gamification-level");

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

        services.AddScoped<IAchievementEventsProducer, AchievementEventsProducer>();
        services.AddScoped<IUserLevelUpEventsProducer, UserLevelUpEventsProducer>();

        return services;
    }
}
