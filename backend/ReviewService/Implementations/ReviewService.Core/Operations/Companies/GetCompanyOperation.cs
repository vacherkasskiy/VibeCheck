using AutoMapper;
using ReviewService.CloudStorage.Abstractions.Services;
using ReviewService.Core.Abstractions.Models.Companies.GetCompany;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Abstractions.Operations.Companies;
using ReviewService.PersistentStorage.Abstractions.Models.Companies.GetCompany;
using ReviewService.PersistentStorage.Abstractions.Repositories.Companies;

namespace ReviewService.Core.Operations.Companies;

internal sealed class GetCompanyOperation(
    IMapper mapper,
    ICompaniesQueryRepository queryRepository,
    ICompanyIconsStorage iconsStorage)
    : IGetCompanyOperation
{
    public async Task<Result<GetCompanyOperationResultModel>> GetAsync(Guid companyId, CancellationToken ct)
    {
        if (companyId == Guid.Empty)
            return Error.Validation("companyId is required");

        var repoInput = mapper.Map<GetCompanyRepositoryInputModel>(companyId);
        var repoOutput = await queryRepository.GetCompanyAsync(repoInput, ct);

        if (repoOutput is null)
            return Error.NotFound("company not found");

        var result = mapper.Map<GetCompanyOperationResultModel>(repoOutput);
        var iconId = repoOutput.IconId;

        if (iconId != Guid.Empty)
        {
            var url = await iconsStorage.GetIconReadUrlAsync(iconId, ct);

            result = result with { IconUrl = url };
        }

        return result;
    }
}