using AutoMapper;
using ReviewService.Core.Abstractions.Models.Companies.GetCompanies;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Abstractions.Operations.Companies;
using ReviewService.PersistentStorage.Abstractions.Models.Companies;
using ReviewService.PersistentStorage.Abstractions.Models.Companies.GetCompanies;
using ReviewService.PersistentStorage.Abstractions.Repositories.Companies;

namespace ReviewService.Core.Operations.Companies;

internal sealed class GetCompaniesOperation(
    IMapper mapper,
    ICompaniesQueryRepository queryRepository)
    : IGetCompaniesOperation
{
    public async Task<Result<GetCompaniesOperationResultModel>> GetAsync(
        GetCompaniesOperationModel model,
        CancellationToken ct)
    {
        var repoInput = mapper.Map<GetCompaniesRepositoryInputModel>(model);
        var repoOutput = await queryRepository.GetCompaniesAsync(repoInput, ct);

        if (repoOutput is null)
            return Error.Failure("failed to load companies");

        return mapper.Map<GetCompaniesOperationResultModel>(repoOutput);
    }
}