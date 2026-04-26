using AutoMapper;
using ReviewService.Core.Abstractions.Models.Companies.CreateCompany;
using ReviewService.Core.Abstractions.Observability;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Abstractions.Operations.Companies;
using ReviewService.PersistentStorage.Abstractions.Models.Companies.CreateCompany;
using ReviewService.PersistentStorage.Abstractions.Repositories.Companies;
using System.Diagnostics;

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
        var stopwatch = Stopwatch.StartNew();
        var status = "success";

        try
        {
            if (model.UserId == Guid.Empty)
            {
                status = "validation";
                return Error.Validation("userId is required");
            }

            var normalizedName = model.Name.Trim();

            if (string.IsNullOrWhiteSpace(normalizedName))
            {
                status = "validation";
                return Error.Validation("name is required");
            }

            if (normalizedName.Length > 200)
            {
                status = "validation";
                return Error.Validation("name is too long");
            }

            var companyExists = await companiesQueryRepository.CompanyExistsByNameAsync(
                normalizedName,
                ct);

            if (companyExists)
            {
                status = "conflict";
                return Error.Conflict("company already exists");
            }

            var pendingRequestExists = await companiesQueryRepository.PendingCompanyRequestExistsByNameAsync(
                normalizedName,
                ct);

            if (pendingRequestExists)
            {
                status = "conflict";
                return Error.Conflict("pending request already exists");
            }

            var repositoryResult = await companiesCommandRepository.CreateCompanyRequestAsync(
                new CreateCompanyRequestRepositoryInputModel
                {
                    RequesterUserId = model.UserId,
                    Name = normalizedName,
                    SiteUrl = model.Site
                },
                ct);

            if (repositoryResult is null)
            {
                status = "failure";
                ReviewMetrics.RecordOperationError("create_company_request", "core", "repository_null");
                return Error.Failure("failed to create company request");
            }

            ReviewMetrics.RecordCompanyRequestCreated("success");

            return new CreateCompanyOperationResultModel
            {
                RequestId = repositoryResult.RequestId.ToString(),
                Status = repositoryResult.Status,
                CreatedAt = new DateTimeOffset(DateTime.SpecifyKind(repositoryResult.CreatedAtUtc, DateTimeKind.Utc))
            };
        }
        catch
        {
            status = "exception";
            ReviewMetrics.RecordOperationError("create_company_request", "core", "exception");
            throw;
        }
        finally
        {
            ReviewMetrics.RecordOperationDuration("create_company_request", "core", status, stopwatch.Elapsed.TotalMilliseconds);
        }
    }
}
