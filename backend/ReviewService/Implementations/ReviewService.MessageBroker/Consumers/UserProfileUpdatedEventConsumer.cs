using MassTransit;
using Microsoft.Extensions.Logging;
using ReviewService.Core.Abstractions.Enums;
using ReviewService.Core.Abstractions.Models.Users;
using ReviewService.Core.Abstractions.Observability;
using ReviewService.Core.Abstractions.Operations.Users;
using System.Diagnostics;
using User.Profile.V1;

namespace ReviewService.MessageBroker.Consumers;

internal sealed class UserProfileUpdatedEventConsumer(
    IApplyUserProfileUpdatedOperation operation,
    ILogger<UserProfileUpdatedEventConsumer> logger)
    : IConsumer<UserProfileUpdatedEvent>
{
    public async Task Consume(ConsumeContext<UserProfileUpdatedEvent> context)
    {
        var stopwatch = Stopwatch.StartNew();
        var status = "success";

        try
        {
            var message = context.Message;
            var userId = Guid.Parse(message.UserId);

            logger.LogInformation(
                "Consuming {MessageType} for user {UserId} profileVersion {ProfileVersion} messageId {MessageId} correlationId {CorrelationId}",
                nameof(UserProfileUpdatedEvent),
                userId,
                message.ProfileVersion,
                context.MessageId,
                context.CorrelationId);

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
                context.CancellationToken);

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
                "Consumed {MessageType} for user {UserId} in {ElapsedMs} ms",
                nameof(UserProfileUpdatedEvent),
                userId,
                stopwatch.Elapsed.TotalMilliseconds);
        }
        catch (Exception exception)
        {
            status = "failed";
            ReviewMetrics.RecordOperationError("user_profile_updated_consumer", "message_broker", "exception");
            logger.LogError(
                exception,
                "Failed to consume {MessageType} messageId {MessageId} correlationId {CorrelationId}",
                nameof(UserProfileUpdatedEvent),
                context.MessageId,
                context.CorrelationId);
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
