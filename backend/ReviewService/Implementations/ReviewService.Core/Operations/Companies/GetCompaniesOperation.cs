using AutoMapper;
using ReviewService.CloudStorage.Abstractions.Services;
using ReviewService.Core.Abstractions.Models.Companies.GetCompanies;
using ReviewService.Core.Abstractions.Observability;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Abstractions.Operations.Companies;
using ReviewService.PersistentStorage.Abstractions.Models.Companies.GetCompanies;
using ReviewService.PersistentStorage.Abstractions.Repositories.Companies;
using System.Diagnostics;

namespace ReviewService.Core.Operations.Companies;

internal sealed class GetCompaniesOperation(
    IMapper mapper,
    ICompaniesQueryRepository queryRepository,
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
            var repoInput = mapper.Map<GetCompaniesRepositoryInputModel>(model);
            var repoOutput = await queryRepository.GetCompaniesAsync(repoInput, ct);

            if (repoOutput is null)
            {
                status = "failure";
                ReviewMetrics.RecordOperationError("get_companies", "core", "repository_null");
                return Error.Failure("failed to load companies");
            }

            var result = mapper.Map<GetCompaniesOperationResultModel>(repoOutput);

            var iconIds = repoOutput.Companies
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
            var companyIconIds = repoOutput.Companies.ToDictionary(x => x.CompanyId, x => x.IconId);

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
}
