using ReviewService.Core.Abstractions.Enums;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Abstractions.Models.Users;
using ReviewService.Core.Abstractions.Operations.Users;
using ReviewService.PersistentStorage.Abstractions.Models.UserProfiles;
using ReviewService.PersistentStorage.Abstractions.Models.UserProfiles.Enums;
using ReviewService.PersistentStorage.Abstractions.Repositories.UserProfiles;

namespace ReviewService.Core.Operations.Users;

internal sealed class ApplyUserProfileUpdatedOperation(
    IUserProfilesCommandRepository userProfilesCommandRepository)
    : IApplyUserProfileUpdatedOperation
{
    public async Task<Result> ApplyAsync(
        ApplyUserProfileUpdatedOperationModel model,
        CancellationToken ct)
    {
        if (model.UserId == Guid.Empty)
            return Error.Validation("userId is required");

        if (model.ProfileVersion <= 0)
            return Error.Validation("profileVersion must be positive");

        await userProfilesCommandRepository.UpsertProfileAsync(
            new UpsertUserProfileRepositoryModel
            {
                UserId = model.UserId,
                ProfileVersion = model.ProfileVersion,
                DisplayName = Normalize(model.DisplayName),
                IconId = Normalize(model.IconId),
                Birthday = model.Birthday,
                Sex = MapSex(model.Sex),
                Education = MapEducation(model.Education),
                Specialization = MapSpecialization(model.Specialization),
                WorkExperience = model.WorkExperience
                    .Select(x => new UpsertUserWorkExperienceRepositoryModel
                    {
                        Specialization = MapSpecialization(x.Specialization),
                        StartedAt = x.StartedAt,
                        FinishedAt = x.FinishedAt
                    })
                    .ToArray()
            },
            ct);

        return Result.Success();
    }

    private static string? Normalize(string? value)
        => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static SexRepositoryEnum MapSex(SexOperationEnum sex)
        => sex switch
        {
            SexOperationEnum.Male => SexRepositoryEnum.Male,
            SexOperationEnum.Female => SexRepositoryEnum.Female,
            SexOperationEnum.Other => SexRepositoryEnum.Other,
            _ => SexRepositoryEnum.Unknown
        };

    private static EducationLevelRepositoryEnum MapEducation(EducationLevelOperationEnum education)
        => education switch
        {
            EducationLevelOperationEnum.Secondary => EducationLevelRepositoryEnum.Secondary,
            EducationLevelOperationEnum.Vocational => EducationLevelRepositoryEnum.Vocational,
            EducationLevelOperationEnum.Bachelor => EducationLevelRepositoryEnum.Bachelor,
            EducationLevelOperationEnum.Master => EducationLevelRepositoryEnum.Master,
            EducationLevelOperationEnum.Phd => EducationLevelRepositoryEnum.Phd,
            _ => EducationLevelRepositoryEnum.Unknown
        };

    private static SpecializationRepositoryEnum MapSpecialization(SpecializationOperationEnum specialization)
        => specialization switch
        {
            SpecializationOperationEnum.Backend => SpecializationRepositoryEnum.Backend,
            SpecializationOperationEnum.Frontend => SpecializationRepositoryEnum.Frontend,
            SpecializationOperationEnum.Fullstack => SpecializationRepositoryEnum.Fullstack,
            SpecializationOperationEnum.Mobile => SpecializationRepositoryEnum.Mobile,
            SpecializationOperationEnum.Data => SpecializationRepositoryEnum.Data,
            SpecializationOperationEnum.DevOps => SpecializationRepositoryEnum.DevOps,
            SpecializationOperationEnum.QA => SpecializationRepositoryEnum.QA,
            SpecializationOperationEnum.PM => SpecializationRepositoryEnum.PM,
            SpecializationOperationEnum.Design => SpecializationRepositoryEnum.Design,
            _ => SpecializationRepositoryEnum.Unknown
        };
}
