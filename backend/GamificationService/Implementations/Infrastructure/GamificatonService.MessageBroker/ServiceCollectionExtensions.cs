using Achievements;
using GamificatonService.MessageBroker.Abstractions.Producers;
using MassTransit;
using Microsoft.Extensions.DependencyInjection;
using GamificatonService.MessageBroker.Producers;

namespace GamificatonService.MessageBroker;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddProducerServices(this IServiceCollection services)
    {
        services.AddScoped<IAchievementEventsProducer, AchievementEventsProducer>();
        services.AddScoped<IUserLevelUpEventsProducer, UserLevelUpEventsProducer>();

        return services;
    }
    
    public static void AddProducersToRider(
        this IRiderRegistrationConfigurator rider)
    {
        rider.AddProducer<AchievementGrantedEvent>("gamification-achievement");
        rider.AddProducer<UserLevelUpEvent>("gamification-level");
    }
}
