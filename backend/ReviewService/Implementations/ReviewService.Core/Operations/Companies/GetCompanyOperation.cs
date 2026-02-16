using AutoMapper;
using ReviewService.Core.Abstractions.Models.Companies.GetCompany;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Abstractions.Operations.Companies;
using ReviewService.PersistentStorage.Abstractions.Models.Companies;
using ReviewService.PersistentStorage.Abstractions.Models.Companies.GetCompany;
using ReviewService.PersistentStorage.Abstractions.Repositories.Companies;

namespace ReviewService.Core.Operations.Companies;

internal sealed class GetCompanyOperation(
    IMapper mapper,
    ICompaniesQueryRepository queryRepository)
    : IGetCompanyOperation
{
    public async Task<Result<GetCompanyOperationResultModel>> GetAsync(Guid companyId, CancellationToken ct)
    {
        var repoInput = mapper.Map<GetCompanyRepositoryInputModel>(companyId);
        var repoOutput = await queryRepository.GetCompanyAsync(repoInput, ct);

        if (repoOutput is null)
            return Error.NotFound("company not found");

        return mapper.Map<GetCompanyOperationResultModel>(repoOutput);
    }
}