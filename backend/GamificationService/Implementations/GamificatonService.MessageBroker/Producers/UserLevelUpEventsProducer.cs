using Achievements;
using GamificatonService.MessageBroker.Abstractions.Producers;
using MassTransit;

namespace GamificatonService.MessageBroker.Producers;

internal sealed class UserLevelUpEventsProducer(
    ITopicProducer<UserLevelUpEvent> producer) : IUserLevelUpEventsProducer
{
    
}