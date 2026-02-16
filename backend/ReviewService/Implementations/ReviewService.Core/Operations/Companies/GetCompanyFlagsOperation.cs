using AutoMapper;
using ReviewService.Core.Abstractions.Models.Companies.GetCompanyFlags;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Abstractions.Operations.Companies;
using ReviewService.PersistentStorage.Abstractions.Models.Companies;
using ReviewService.PersistentStorage.Abstractions.Models.Companies.GetCompanyFlags;
using ReviewService.PersistentStorage.Abstractions.Repositories.Companies;

namespace ReviewService.Core.Operations.Companies;

internal sealed class GetCompanyFlagsOperation(
    IMapper mapper,
    ICompaniesQueryRepository queryRepository)
    : IGetCompanyFlagsOperation
{
    public async Task<Result<GetCompanyFlagsOperationResultModel>> GetAsync(
        GetCompanyFlagsOperationModel model,
        CancellationToken ct)
    {
        var repoInput = mapper.Map<GetCompanyFlagsRepositoryInputModel>(model);
        var repoOutput = await queryRepository.GetCompanyFlagsAsync(repoInput, ct);

        if (repoOutput is null)
            return Error.NotFound("company not found");

        return mapper.Map<GetCompanyFlagsOperationResultModel>(repoOutput);
    }
}