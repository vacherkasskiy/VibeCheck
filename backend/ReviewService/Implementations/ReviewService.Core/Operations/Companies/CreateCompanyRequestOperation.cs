using AutoMapper;
using ReviewService.Core.Abstractions.Models.Companies.CreateCompany;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Abstractions.Operations.Companies;
using ReviewService.PersistentStorage.Abstractions.Models.Companies.CreateCompany;
using ReviewService.PersistentStorage.Abstractions.Repositories.Companies;

namespace ReviewService.Core.Operations.Companies;

internal sealed class CreateCompanyRequestOperation(
    IMapper mapper,
    ICompaniesQueryRepository companiesQueryRepository,
    ICompaniesCommandRepository companiesCommandRepository)
    : ICreateCompanyRequestOperation
{
    public async Task<Result<CreateCompanyOperationResultModel>> CreateAsync(
        CreateCompanyOperationRequestModel model,
        CancellationToken ct)
    {
        if (model.UserId == Guid.Empty)
            return Error.Validation("userId is required");

        var normalizedName = model.Name.Trim();

        if (string.IsNullOrWhiteSpace(normalizedName))
            return Error.Validation("name is required");

        if (normalizedName.Length > 200)
            return Error.Validation("name is too long");

        if (string.IsNullOrWhiteSpace(model.IconId))
            return Error.Validation("iconId is required");

        var companyExists = await companiesQueryRepository.CompanyExistsByNameAsync(
            normalizedName,
            ct);

        if (companyExists)
            return Error.Conflict("company already exists");

        var pendingRequestExists = await companiesQueryRepository.PendingCompanyRequestExistsByNameAsync(
            normalizedName,
            ct);

        if (pendingRequestExists)
            return Error.Conflict("pending request already exists");

        var repositoryResult = await companiesCommandRepository.CreateCompanyRequestAsync(
            new CreateCompanyRequestRepositoryInputModel
            {
                RequesterUserId = model.UserId,
                Name = normalizedName,
                IconId = model.IconId,
                SiteUrl = model.Site
            },
            ct);

        if (repositoryResult is null)
            return Error.Failure("failed to create company request");

        return new CreateCompanyOperationResultModel
        {
            RequestId = repositoryResult.RequestId.ToString(),
            Status = repositoryResult.Status,
            CreatedAt = new DateTimeOffset(DateTime.SpecifyKind(repositoryResult.CreatedAtUtc, DateTimeKind.Utc))
        };
    }
}