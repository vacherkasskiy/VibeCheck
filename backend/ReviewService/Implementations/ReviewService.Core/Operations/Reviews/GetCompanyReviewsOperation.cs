using AutoMapper;
using ReviewService.Core.Abstractions.Enums;
using ReviewService.Core.Abstractions.Models.Reviews.GetCompanyReviews;
using ReviewService.Core.Abstractions.Observability;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Abstractions.Operations.Reviews;
using ReviewService.PersistentStorage.Abstractions.Models.UserProfiles;
using ReviewService.PersistentStorage.Abstractions.Models.UserProfiles.Enums;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews.GetCompanyReviews;
using ReviewService.PersistentStorage.Abstractions.Repositories.Reviews;
using ReviewService.PersistentStorage.Abstractions.Repositories.UserProfiles;
using System.Diagnostics;

namespace ReviewService.Core.Operations.Reviews;

internal sealed class GetCompanyReviewsOperation(
    IMapper mapper,
    IReviewsQueryRepository queryRepository,
    IUserProfilesQueryRepository userProfilesQueryRepository)
    : IGetCompanyReviewsOperation
{
    public async Task<Result<CompanyReviewsPageOperationModel>> GetAsync(
        GetCompanyReviewsOperationModel model,
        CancellationToken ct)
    {
        var stopwatch = Stopwatch.StartNew();
        var status = "success";

        try
        {
            if (model.CompanyId == Guid.Empty)
            {
                status = "validation";
                return Error.Validation("companyId is required");
            }

            if (model.CurrentUserId == Guid.Empty)
            {
                status = "validation";
                return Error.Validation("currentUserId is required");
            }

            var repoOutput = IsWeightSort(model.Sort)
                ? await queryRepository.GetCompanyReviewsForWeightAsync(model.CompanyId, ct)
                : await GetCompanyReviewsAsync(model, ct);

            if (repoOutput is null)
            {
                status = "not_found";
                return Error.NotFound("company not found");
            }

            var page = mapper.Map<CompanyReviewsPageOperationModel>(repoOutput);
            var authorIds = page.Reviews
                .Select(r => r.AuthorId)
                .Where(id => id != Guid.Empty)
                .Distinct()
                .ToArray();

            if (authorIds.Length == 0)
                return page;

            if (IsWeightSort(model.Sort))
            {
                return await EnrichAndSortByWeightAsync(
                    page,
                    model.CurrentUserId,
                    authorIds,
                    model.Sort,
                    model.Take,
                    model.PageNum,
                    ct);
            }

            var iconsByUserId = await userProfilesQueryRepository.GetIconIdsByUserIdsAsync(authorIds, ct);

            foreach (var review in page.Reviews)
            {
                if (review.AuthorId == Guid.Empty)
                    continue;

                iconsByUserId.TryGetValue(review.AuthorId, out var iconId);
                review.AuthorIconId = iconId;
            }

            return page;
        }
        catch
        {
            status = "exception";
            ReviewMetrics.RecordOperationError("get_company_reviews", "core", "exception");
            throw;
        }
        finally
        {
            ReviewMetrics.RecordOperationDuration("get_company_reviews", "core", status, stopwatch.Elapsed.TotalMilliseconds);
        }
    }

    private async Task<GetCompanyReviewsRepositoryOutputModel?> GetCompanyReviewsAsync(
        GetCompanyReviewsOperationModel model,
        CancellationToken ct)
    {
        var repoInput = mapper.Map<GetCompanyReviewsRepositoryInputModel>(model);
        return await queryRepository.GetCompanyReviewsAsync(repoInput, ct);
    }

    private async Task<CompanyReviewsPageOperationModel> EnrichAndSortByWeightAsync(
        CompanyReviewsPageOperationModel page,
        Guid currentUserId,
        IReadOnlyCollection<Guid> authorIds,
        ReviewsSortOperationEnum sort,
        int requestedTake,
        int requestedPageNum,
        CancellationToken ct)
    {
        var profileIds = authorIds
            .Append(currentUserId)
            .Where(id => id != Guid.Empty)
            .Distinct()
            .ToArray();

        var profilesByUserId = await userProfilesQueryRepository.GetProfilesForSimilarityByUserIdsAsync(profileIds, ct);
        profilesByUserId.TryGetValue(currentUserId, out var currentUserProfile);

        var weightedReviews = page.Reviews
            .Select(review =>
            {
                profilesByUserId.TryGetValue(review.AuthorId, out var authorProfile);

                return review with
                {
                    AuthorIconId = authorProfile?.IconId ?? review.AuthorIconId,
                    Weight = CalculateWeight(currentUserProfile, authorProfile)
                };
            });

        weightedReviews = sort == ReviewsSortOperationEnum.WeightAsc
            ? weightedReviews
                .OrderBy(x => x.Weight)
                .ThenByDescending(x => x.CreatedAt)
                .ThenByDescending(x => x.ReviewId)
            : weightedReviews
                .OrderByDescending(x => x.Weight)
                .ThenByDescending(x => x.CreatedAt)
                .ThenByDescending(x => x.ReviewId);

        var take = ClampInt(requestedTake, 1, 100);
        var pageNum = Math.Max(1, requestedPageNum);

        return page with
        {
            Reviews = weightedReviews
                .Skip((pageNum - 1) * take)
                .Take(take)
                .ToList()
        };
    }

    private static bool IsWeightSort(ReviewsSortOperationEnum sort)
    {
        return sort is ReviewsSortOperationEnum.WeightDesc
            or ReviewsSortOperationEnum.WeightAsc;
    }

    private static int ClampInt(int value, int min, int max)
    {
        return Math.Min(Math.Max(value, min), max);
    }

    private static double CalculateWeight(
        UserProfileForSimilarityRepositoryModel? currentUserProfile,
        UserProfileForSimilarityRepositoryModel? authorProfile)
    {
        if (currentUserProfile is null || authorProfile is null)
            return 0;

        const double flagsWeight = 0.6;
        const double areaWeight = 0.15;
        const double experienceWeight = 0.1;
        const double educationWeight = 0.1;
        const double ageWeight = 0.05;

        return flagsWeight * CalculateFlagsSimilarity(currentUserProfile, authorProfile)
            + areaWeight * CalculateAreaSimilarity(currentUserProfile, authorProfile)
            + experienceWeight * CalculateExperienceSimilarity(currentUserProfile, authorProfile)
            + educationWeight * CalculateEducationSimilarity(currentUserProfile, authorProfile)
            + ageWeight * CalculateAgeSimilarity(currentUserProfile, authorProfile);
    }

    private static double CalculateFlagsSimilarity(
        UserProfileForSimilarityRepositoryModel currentUserProfile,
        UserProfileForSimilarityRepositoryModel authorProfile)
    {
        var authorFlagsById = authorProfile.Flags.ToDictionary(x => x.FlagId);

        return currentUserProfile.Flags.Sum(currentFlag =>
        {
            if (!authorFlagsById.TryGetValue(currentFlag.FlagId, out var authorFlag))
                return 0;

            return GetColorSign(currentFlag.Color)
                * GetColorSign(authorFlag.Color)
                * GetPriority(currentFlag.Weight)
                * GetPriority(authorFlag.Weight);
        });
    }

    private static double CalculateAreaSimilarity(
        UserProfileForSimilarityRepositoryModel currentUserProfile,
        UserProfileForSimilarityRepositoryModel authorProfile)
    {
        if (currentUserProfile.Specialization == SpecializationRepositoryEnum.Unknown)
            return 0;

        return currentUserProfile.Specialization == authorProfile.Specialization ? 1 : 0;
    }

    private static double CalculateExperienceSimilarity(
        UserProfileForSimilarityRepositoryModel currentUserProfile,
        UserProfileForSimilarityRepositoryModel authorProfile)
    {
        if (CalculateAreaSimilarity(currentUserProfile, authorProfile) == 0)
            return 0;

        var currentExperienceDays = CalculateExperienceDays(currentUserProfile);
        var authorExperienceDays = CalculateExperienceDays(authorProfile);
        var maxExperienceDays = Math.Max(currentExperienceDays, authorExperienceDays);

        if (maxExperienceDays <= 0)
            return 0;

        return Math.Min(currentExperienceDays, authorExperienceDays) / maxExperienceDays;
    }

    private static double CalculateEducationSimilarity(
        UserProfileForSimilarityRepositoryModel currentUserProfile,
        UserProfileForSimilarityRepositoryModel authorProfile)
    {
        if (currentUserProfile.Education == EducationLevelRepositoryEnum.Unknown)
            return 0;

        return currentUserProfile.Education == authorProfile.Education ? 1 : 0;
    }

    private static double CalculateAgeSimilarity(
        UserProfileForSimilarityRepositoryModel currentUserProfile,
        UserProfileForSimilarityRepositoryModel authorProfile)
    {
        if (currentUserProfile.Birthday is null || authorProfile.Birthday is null)
            return 0;

        var ageDifferenceYears = Math.Abs((currentUserProfile.Birthday.Value - authorProfile.Birthday.Value).TotalDays)
            / 365.2425;

        return Math.Max(0, 1 - Math.Min(ageDifferenceYears, 20) / 20);
    }

    private static double CalculateExperienceDays(UserProfileForSimilarityRepositoryModel profile)
    {
        var now = DateTime.UtcNow.Date;

        return profile.WorkExperience
            .Where(x => x.Specialization == profile.Specialization)
            .Sum(x =>
            {
                var finishedAt = (x.FinishedAt ?? now).Date;
                return Math.Max(0, (finishedAt - x.StartedAt.Date).TotalDays);
            });
    }

    private static int GetPriority(int weight)
    {
        return Math.Clamp(weight, 1, 3);
    }

    private static int GetColorSign(UserProfileFlagColorRepositoryEnum color)
    {
        return color == UserProfileFlagColorRepositoryEnum.Green ? 1 : -1;
    }
}
