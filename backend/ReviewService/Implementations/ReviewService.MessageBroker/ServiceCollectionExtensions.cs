using Confluent.Kafka;
using MassTransit;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Reports;
using Reviews;
using ReviewService.MessageBroker.Consumers;
using ReviewService.MessageBroker.Abstractions.Options;
using ReviewService.MessageBroker.Abstractions.Producers;
using ReviewService.MessageBroker.Producers;
using User.Profile.V1;

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
                rider.AddConsumer<UserProfileUpdatedEventConsumer>();
                rider.AddProducer<ReviewWrittenEvent>("reviews-written");
                rider.AddProducer<ReviewLikedEvent>("reviews-liked");
                rider.AddProducer<ReviewReportedEvent>("reports");

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

                    k.TopicEndpoint<UserProfileUpdatedEvent>(
                        "users",
                        "review-users-consumers",
                        e =>
                        {
                            e.ConfigureConsumer<UserProfileUpdatedEventConsumer>(context);
                        });
                });
            });
        });

        services.AddScoped<IReviewEventsProducer, ReviewWrittenEventsProducer>();
        services.AddScoped<IReviewLikesEventsProducer, ReviewLikesEventsProducer>();
        services.AddScoped<IReportEventsProducer, ReportEventsProducer>();

        return services;
    }
}
