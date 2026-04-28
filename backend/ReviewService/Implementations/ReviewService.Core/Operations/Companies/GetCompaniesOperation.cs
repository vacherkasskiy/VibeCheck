using AutoMapper;
using ReviewService.CloudStorage.Abstractions.Services;
using ReviewService.Core.Abstractions.Models.Companies.GetCompanies;
using ReviewService.Core.Abstractions.Observability;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Abstractions.Operations.Companies;
using ReviewService.PersistentStorage.Abstractions.Models.Companies.GetCompanies;
using ReviewService.PersistentStorage.Abstractions.Models.UserProfiles;
using ReviewService.PersistentStorage.Abstractions.Models.UserProfiles.Enums;
using ReviewService.PersistentStorage.Abstractions.Repositories.Companies;
using ReviewService.PersistentStorage.Abstractions.Repositories.UserProfiles;
using System.Diagnostics;

namespace ReviewService.Core.Operations.Companies;

internal sealed class GetCompaniesOperation(
    IMapper mapper,
    ICompaniesQueryRepository queryRepository,
    IUserProfilesQueryRepository userProfilesQueryRepository,
    ICompanyIconsStorage iconsStorage)
    : IGetCompaniesOperation
{
    public async Task<Result<GetCompaniesOperationResultModel>> GetAsync(
        GetCompaniesOperationModel model,
        CancellationToken ct)
    {
        var stopwatch = Stopwatch.StartNew();
        var status = "success";

        try
        {
            if (model.CurrentUserId == Guid.Empty)
            {
                status = "validation";
                return Error.Validation("currentUserId is required");
            }

            var repoInput = mapper.Map<GetCompaniesRepositoryInputModel>(model);
            var repoOutput = await queryRepository.GetCompaniesForWeightAsync(repoInput, ct);

            if (repoOutput is null)
            {
                status = "failure";
                ReviewMetrics.RecordOperationError("get_companies", "core", "repository_null");
                return Error.Failure("failed to load companies");
            }

            var userFlags = await userProfilesQueryRepository.GetUserFlagsForWeightAsync(model.CurrentUserId, ct);
            var weightedRepoOutput = repoOutput with
            {
                Companies = ApplyWeightSortAndPagination(repoOutput.Companies, userFlags, model.Take, model.PageNum)
            };

            var result = mapper.Map<GetCompaniesOperationResultModel>(weightedRepoOutput);

            var iconIds = weightedRepoOutput.Companies
                .Select(x => x.IconId)
                .Where(id => id != Guid.Empty)
                .Distinct()
                .ToArray();

            if (iconIds.Length == 0)
                return result;

            var urlTasks = iconIds.ToDictionary(
                id => id,
                id => iconsStorage.GetIconReadUrlAsync(id, ct));

            await Task.WhenAll(urlTasks.Values);

            var urls = urlTasks.ToDictionary(k => k.Key, v => v.Value.Result);
            var companyIconIds = weightedRepoOutput.Companies.ToDictionary(x => x.CompanyId, x => x.IconId);

            foreach (var company in result.Companies)
            {
                if (!companyIconIds.TryGetValue(company.CompanyId, out var iconId) || iconId == Guid.Empty)
                    continue;

                if (urls.TryGetValue(iconId, out var url))
                    company.IconUrl = url;
            }

            return result;
        }
        catch
        {
            status = "exception";
            ReviewMetrics.RecordOperationError("get_companies", "core", "exception");
            throw;
        }
        finally
        {
            ReviewMetrics.RecordOperationDuration("get_companies", "core", status, stopwatch.Elapsed.TotalMilliseconds);
        }
    }

    private static IReadOnlyList<CompanyListItemRepositoryModel> ApplyWeightSortAndPagination(
        IReadOnlyList<CompanyListItemRepositoryModel> companies,
        IReadOnlyList<UserProfileFlagForSimilarityRepositoryModel> userFlags,
        long requestedTake,
        long requestedPageNum)
    {
        var take = ClampLong(requestedTake, 1, 100);
        var pageNum = Math.Max(1, requestedPageNum);
        var skip = (pageNum - 1) * take;

        var userFlagsById = userFlags
            .GroupBy(x => x.FlagId)
            .ToDictionary(
                x => x.Key,
                x => x.OrderByDescending(flag => GetPriority(flag.Weight)).First());

        return companies
            .Select(company => new
            {
                Company = company,
                Weight = CalculateWeight(company, userFlagsById)
            })
            .OrderByDescending(x => x.Weight)
            .ThenBy(x => x.Company.Name)
            .ThenBy(x => x.Company.CompanyId)
            .Skip((int)skip)
            .Take((int)take)
            .Select(x => x.Company with { Weight = x.Weight })
            .ToList();
    }

    private static double CalculateWeight(
        CompanyListItemRepositoryModel company,
        IReadOnlyDictionary<Guid, UserProfileFlagForSimilarityRepositoryModel> userFlagsById)
    {
        return company.TopFlags.Sum(companyFlag =>
        {
            if (!userFlagsById.TryGetValue(companyFlag.Id, out var userFlag))
                return 0;

            return GetColorSign(userFlag.Color)
                * GetPriority(userFlag.Weight)
                * companyFlag.Count;
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

    private static long ClampLong(long value, long min, long max)
    {
        return Math.Min(Math.Max(value, min), max);
    }
}
