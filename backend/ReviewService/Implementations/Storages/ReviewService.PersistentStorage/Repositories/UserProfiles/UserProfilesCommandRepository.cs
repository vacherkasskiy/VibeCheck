using Microsoft.EntityFrameworkCore;
using ReviewService.PersistentStorage.Abstractions.Models.UserProfiles;
using ReviewService.PersistentStorage.Abstractions.Repositories.UserProfiles;
using ReviewService.PersistentStorage.Entities;
using ReviewService.PersistentStorage.Entities.Enums;

namespace ReviewService.PersistentStorage.Repositories.UserProfiles;

internal sealed class UserProfilesCommandRepository(AppDbContext dbContext)
    : IUserProfilesCommandRepository
{
    public async Task<bool> UpsertProfileAsync(
        UpsertUserProfileRepositoryModel model,
        CancellationToken ct)
    {
        var profile = await dbContext.UserProfiles
            .Include(x => x.WorkExperience)
            .SingleOrDefaultAsync(x => x.UserId == model.UserId, ct);

        if (profile is not null && model.ProfileVersion <= profile.ProfileVersion)
            return false;

        var utcNow = DateTime.UtcNow;

        if (profile is null)
        {
            profile = new UserProfileEntity
            {
                UserId = model.UserId,
                ProfileVersion = model.ProfileVersion,
                DisplayName = model.DisplayName,
                IconId = model.IconId,
                Birthday = model.Birthday,
                Sex = (SexEntityEnum)model.Sex,
                Education = (EducationLevelEntityEnum)model.Education,
                Specialization = (SpecializationEntityEnum)model.Specialization,
                UpdatedAt = utcNow
            };

            await dbContext.UserProfiles.AddAsync(profile, ct);
        }
        else
        {
            profile.ProfileVersion = model.ProfileVersion;
            profile.DisplayName = model.DisplayName;
            profile.IconId = model.IconId;
            profile.Birthday = model.Birthday;
            profile.Sex = (SexEntityEnum)model.Sex;
            profile.Education = (EducationLevelEntityEnum)model.Education;
            profile.Specialization = (SpecializationEntityEnum)model.Specialization;
            profile.UpdatedAt = utcNow;

            if (profile.WorkExperience.Count > 0)
                dbContext.UserWorkExperiences.RemoveRange(profile.WorkExperience);
        }

        var workExperience = model.WorkExperience.Select(x => new UserWorkExperienceEntity
        {
            Id = Guid.NewGuid(),
            UserId = model.UserId,
            Specialization = (SpecializationEntityEnum)x.Specialization,
            StartedAt = DateTime.SpecifyKind(x.StartedAt, DateTimeKind.Utc),
            FinishedAt = x.FinishedAt.HasValue
                ? DateTime.SpecifyKind(x.FinishedAt.Value, DateTimeKind.Utc)
                : null
        });

        await dbContext.UserWorkExperiences.AddRangeAsync(workExperience, ct);
        await dbContext.SaveChangesAsync(ct);

        return true;
    }
}
