using ReviewService.Core.Abstractions.Models.Companies.CreateCompany;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Abstractions.Operations.Companies;
using ReviewService.PersistentStorage.Abstractions.Models.Companies.CreateCompany;
using ReviewService.PersistentStorage.Abstractions.Repositories.Companies;

namespace ReviewService.Core.Operations.Companies;

internal sealed class CreateCompanyRequestOperation(
    ICompaniesQueryRepository companiesQueryRepository,
    ICompaniesCommandRepository companiesCommandRepository)
    : ICreateCompanyRequestOperation
{
    public async Task<Result<CreateCompanyOperationResultModel>> CreateAsync(
        CreateCompanyOperationRequestModel model,
        CancellationToken ct)
    {
        var normalizedName = model.Name.Trim();

        if (string.IsNullOrWhiteSpace(normalizedName))
            return Result<CreateCompanyOperationResultModel>.Failure(Error.Validation("company_name_is_required"));

        if (normalizedName.Length > 200)
            return Result<CreateCompanyOperationResultModel>.Failure(Error.Validation("company_name_is_too_long"));

        if (string.IsNullOrWhiteSpace(model.IconId))
            return Result<CreateCompanyOperationResultModel>.Failure(Error.Validation("icon_id_is_required"));

        var companyExists = await companiesQueryRepository.CompanyExistsByNameAsync(
            normalizedName,
            ct);

        if (companyExists)
            return Result<CreateCompanyOperationResultModel>.Failure(Error.Conflict("company_already_exists"));

        var pendingRequestExists = await companiesQueryRepository.PendingCompanyRequestExistsByNameAsync(
            normalizedName,
            ct);

        if (pendingRequestExists)
            return Result<CreateCompanyOperationResultModel>.Failure(Error.Conflict("pending_request_already_exists"));

        var repositoryResult = await companiesCommandRepository.CreateCompanyRequestAsync(
            new CreateCompanyRequestRepositoryInputModel
            {
                RequesterUserId = model.UserId,
                Name = normalizedName,
                IconId = model.IconId,
                SiteUrl = model.Site
            },
            ct);

        return Result<CreateCompanyOperationResultModel>.Success(new CreateCompanyOperationResultModel
        {
            RequestId = repositoryResult.RequestId.ToString(),
            Status = repositoryResult.Status,
            CreatedAt = new DateTimeOffset(DateTime.SpecifyKind(repositoryResult.CreatedAtUtc, DateTimeKind.Utc))
        });
    }
}