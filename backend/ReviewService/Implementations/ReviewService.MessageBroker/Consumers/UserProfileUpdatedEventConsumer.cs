using Confluent.Kafka;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ReviewService.Core.Abstractions.Enums;
using ReviewService.Core.Abstractions.Models.Users;
using ReviewService.Core.Abstractions.Observability;
using ReviewService.Core.Abstractions.Operations.Users;
using ReviewService.MessageBroker.Abstractions.Options;
using System.Diagnostics;
using User.Profile.V1;

namespace ReviewService.MessageBroker.Consumers;

internal sealed class UserProfileUpdatedEventConsumer(
    IServiceScopeFactory scopeFactory,
    IOptions<KafkaOptions> options,
    ILogger<UserProfileUpdatedEventConsumer> logger)
    : BackgroundService
{
    private const string Topic = "users";
    private const string ConsumerGroup = "review-users-consumers";

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await Task.Yield();

        using var consumer = new ConsumerBuilder<string, byte[]>(
                KafkaClientConfigFactory.CreateConsumerConfig(options.Value, ConsumerGroup))
            .SetKeyDeserializer(Deserializers.Utf8)
            .SetValueDeserializer(Deserializers.ByteArray)
            .SetErrorHandler((_, error) =>
            {
                logger.LogError(
                    "Kafka consumer error for topic {Topic}: {Reason}",
                    Topic,
                    error.Reason);
            })
            .Build();

        consumer.Subscribe(Topic);

        try
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                ConsumeResult<string, byte[]>? consumeResult = null;

                try
                {
                    consumeResult = consumer.Consume(stoppingToken);
                    if (consumeResult?.Message?.Value is null)
                        continue;

                    await ConsumeAsync(consumeResult, stoppingToken);
                    consumer.Commit(consumeResult);
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    break;
                }
                catch (ConsumeException exception)
                {
                    ReviewMetrics.RecordOperationError("user_profile_updated_consumer", "message_broker", "consume_exception");
                    logger.LogError(
                        exception,
                        "Failed to consume Kafka message from topic {Topic}",
                        Topic);
                }
                catch (Exception exception)
                {
                    ReviewMetrics.RecordOperationError("user_profile_updated_consumer", "message_broker", "exception");
                    logger.LogError(
                        exception,
                        "Failed to process Kafka message from topic {Topic} partition {Partition} offset {Offset}",
                        consumeResult?.Topic,
                        consumeResult?.Partition.Value,
                        consumeResult?.Offset.Value);

                    if (consumeResult is not null)
                        consumer.Seek(consumeResult.TopicPartitionOffset);

                    await Task.Delay(TimeSpan.FromSeconds(1), stoppingToken);
                }
            }
        }
        finally
        {
            consumer.Close();
        }
    }

    private async Task ConsumeAsync(
        ConsumeResult<string, byte[]> consumeResult,
        CancellationToken ct)
    {
        var stopwatch = Stopwatch.StartNew();
        var status = "success";

        try
        {
            var message = UserProfileUpdatedEvent.Parser.ParseFrom(consumeResult.Message.Value);
            var userId = Guid.Parse(message.UserId);

            logger.LogInformation(
                "Consuming {MessageType} for user {UserId} profileVersion {ProfileVersion} topic {Topic} partition {Partition} offset {Offset}",
                nameof(UserProfileUpdatedEvent),
                userId,
                message.ProfileVersion,
                consumeResult.Topic,
                consumeResult.Partition.Value,
                consumeResult.Offset.Value);

            using var scope = scopeFactory.CreateScope();
            var operation = scope.ServiceProvider.GetRequiredService<IApplyUserProfileUpdatedOperation>();

            var result = await operation.ApplyAsync(
                new ApplyUserProfileUpdatedOperationModel
                {
                    UserId = userId,
                    ProfileVersion = message.ProfileVersion,
                    DisplayName = message.Name,
                    IconId = message.IconId,
                    Birthday = message.Birthday?.ToDateTime(),
                    Sex = MapSex(message.Sex),
                    Education = MapEducation(message.Education),
                    Specialization = MapSpecialization(message.Specialization),
                    WorkExperience = message.WorkExperience
                        .Select(x => new UserWorkExperienceOperationModel
                        {
                            Specialization = MapSpecialization(x.Specialization),
                            StartedAt = x.StartedAt.ToDateTime(),
                            FinishedAt = x.FinishedAt is null ? null : x.FinishedAt.ToDateTime()
                        })
                        .ToArray()
                },
                ct);

            if (result.IsFailure)
            {
                status = "failed";
                logger.LogWarning(
                    "User profile update failed for user {UserId} profileVersion {ProfileVersion}: {ErrorMessage}",
                    userId,
                    message.ProfileVersion,
                    result.Error.Message);
                throw new InvalidOperationException(result.Error.Message);
            }

            logger.LogInformation(
                "Consumed {MessageType} for user {UserId} topic {Topic} partition {Partition} offset {Offset} in {ElapsedMs} ms",
                nameof(UserProfileUpdatedEvent),
                userId,
                consumeResult.Topic,
                consumeResult.Partition.Value,
                consumeResult.Offset.Value,
                stopwatch.Elapsed.TotalMilliseconds);
        }
        catch (Exception exception)
        {
            status = "failed";
            ReviewMetrics.RecordOperationError("user_profile_updated_consumer", "message_broker", "exception");
            logger.LogError(
                exception,
                "Failed to consume {MessageType} topic {Topic} partition {Partition} offset {Offset}",
                nameof(UserProfileUpdatedEvent),
                consumeResult.Topic,
                consumeResult.Partition.Value,
                consumeResult.Offset.Value);
            throw;
        }
        finally
        {
            ReviewMetrics.RecordOperationDuration("user_profile_updated_consumer", "message_broker", status, stopwatch.Elapsed.TotalMilliseconds);
        }
    }

    private static SexOperationEnum MapSex(Sex sex)
        => sex switch
        {
            Sex.Male => SexOperationEnum.Male,
            Sex.Female => SexOperationEnum.Female,
            Sex.Other => SexOperationEnum.Other,
            _ => SexOperationEnum.Unknown
        };

    private static EducationLevelOperationEnum MapEducation(Education education)
        => education switch
        {
            Education.LevelSecondary => EducationLevelOperationEnum.Secondary,
            Education.LevelSecondaryProfessional => EducationLevelOperationEnum.Vocational,
            Education.LevelBachelor => EducationLevelOperationEnum.Bachelor,
            Education.LevelMaster => EducationLevelOperationEnum.Master,
            Education.LevelPostgraduate or Education.LevelDoctorate => EducationLevelOperationEnum.Phd,
            _ => EducationLevelOperationEnum.Unknown
        };

    private static SpecializationOperationEnum MapSpecialization(Specialization specialization)
        => specialization switch
        {
            Specialization.SpecialtyIt => SpecializationOperationEnum.Backend,
            Specialization.SpecialtyDesign => SpecializationOperationEnum.Design,
            Specialization.SpecialtyProjectManagement => SpecializationOperationEnum.PM,
            Specialization.SpecialtyAnalytics => SpecializationOperationEnum.Data,
            _ => SpecializationOperationEnum.Unknown
        };
}
