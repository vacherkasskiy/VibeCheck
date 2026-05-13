using ReviewService.Core.Abstractions.Models.Admin.Companies;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Abstractions.Observability;
using ReviewService.Core.Abstractions.Operations.Admin.Companies;
using ReviewService.PersistentStorage.Abstractions.Models.Admin.Companies;
using ReviewService.PersistentStorage.Abstractions.Repositories.Admin.Companies;
using System.Diagnostics;

namespace ReviewService.Core.Operations.Admin.Companies;

internal sealed class AdminCompaniesOperations(
    IAdminCompaniesQueryRepository queryRepository,
    IAdminCompaniesCommandRepository commandRepository)
    : IGetAdminCompaniesOperation,
        IGetAdminCompanyOperation,
        ICreateAdminCompanyOperation,
        IUpdateAdminCompanyOperation,
        IDeleteAdminCompanyOperation,
        IGetCompanyRequestsOperation
{
    public async Task<Result<AdminCompaniesPageOperationModel>> GetAsync(
        GetAdminCompaniesOperationModel model,
        CancellationToken ct)
    {
        var stopwatch = Stopwatch.StartNew();
        var status = "success";

        try
        {
            var repoResult = await queryRepository.GetCompaniesAsync(
                new GetAdminCompaniesRepositoryInputModel
                {
                    Q = model.Q,
                    Take = model.Take,
                    PageNum = model.PageNum
                },
                ct);

            return new AdminCompaniesPageOperationModel
            {
                TotalCount = repoResult.TotalCount,
                Companies = repoResult.Companies.Select(MapCompany).ToArray()
            };
        }
        catch
        {
            status = "exception";
            ReviewMetrics.RecordOperationError("admin_get_companies", "core", "exception");
            throw;
        }
        finally
        {
            ReviewMetrics.RecordOperationDuration("admin_get_companies", "core", status, stopwatch.Elapsed.TotalMilliseconds);
        }
    }

    public async Task<Result<AdminCompanyOperationModel>> GetAsync(
        Guid companyId,
        CancellationToken ct)
    {
        if (companyId == Guid.Empty)
            return Error.Validation("companyId is required");

        var company = await queryRepository.GetCompanyAsync(companyId, ct);

        if (company is null)
            return Error.NotFound("company not found");

        return MapCompany(company);
    }

    public async Task<Result<CompanyRequestsPageOperationModel>> GetAsync(
        GetCompanyRequestsOperationModel model,
        CancellationToken ct)
    {
        var repoResult = await queryRepository.GetCompanyRequestsAsync(
            new GetCompanyRequestsRepositoryInputModel
            {
                Status = model.Status,
                Q = model.Q,
                Take = model.Take,
                PageNum = model.PageNum
            },
            ct);

        return new CompanyRequestsPageOperationModel
        {
            TotalCount = repoResult.TotalCount,
            Requests = repoResult.Requests.Select(MapCompanyRequest).ToArray()
        };
    }

    public async Task<Result<AdminCompanyOperationModel>> CreateAsync(
        CreateAdminCompanyOperationModel model,
        CancellationToken ct)
    {
        var validation = await ValidateCompanyModelAsync(
            model.Name,
            model.IconId,
            model.SiteUrl,
            model.LinkedinUrl,
            model.HrUrl,
            null,
            ct);

        if (validation is not null)
            return validation;

        var company = await commandRepository.CreateAsync(
            new UpsertAdminCompanyRepositoryModel
            {
                Name = model.Name.Trim(),
                Description = model.Description,
                IconId = model.IconId,
                SiteUrl = model.SiteUrl,
                LinkedinUrl = model.LinkedinUrl,
                HrUrl = model.HrUrl
            },
            DateTime.UtcNow,
            ct);

        return MapCompany(company);
    }

    public async Task<Result<AdminCompanyOperationModel>> UpdateAsync(
        UpdateAdminCompanyOperationModel model,
        CancellationToken ct)
    {
        if (model.CompanyId == Guid.Empty)
            return Error.Validation("companyId is required");

        var validation = await ValidateCompanyModelAsync(
            model.Name,
            model.IconId,
            model.SiteUrl,
            model.LinkedinUrl,
            model.HrUrl,
            model.CompanyId,
            ct);

        if (validation is not null)
            return validation;

        var company = await commandRepository.UpdateAsync(
            model.CompanyId,
            new UpsertAdminCompanyRepositoryModel
            {
                Name = model.Name.Trim(),
                Description = model.Description,
                IconId = model.IconId,
                SiteUrl = model.SiteUrl,
                LinkedinUrl = model.LinkedinUrl,
                HrUrl = model.HrUrl
            },
            DateTime.UtcNow,
            ct);

        if (company is null)
            return Error.NotFound("company not found");

        return MapCompany(company);
    }

    public async Task<Result> DeleteAsync(Guid companyId, CancellationToken ct)
    {
        if (companyId == Guid.Empty)
            return Error.Validation("companyId is required");

        var company = await queryRepository.GetCompanyAsync(companyId, ct);

        if (company is null)
            return Error.NotFound("company not found");

        var hasReviews = await queryRepository.CompanyHasReviewsAsync(companyId, ct);

        if (hasReviews)
            return Error.Validation("company has reviews");

        await commandRepository.DeleteAsync(companyId, ct);

        return Result.Success();
    }

    private async Task<Error?> ValidateCompanyModelAsync(
        string? name,
        Guid? iconId,
        string? siteUrl,
        string? linkedinUrl,
        string? hrUrl,
        Guid? exceptCompanyId,
        CancellationToken ct)
    {
        var normalizedName = name?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(normalizedName))
            return Error.Validation("name is required");

        if (normalizedName.Length > 200)
            return Error.Validation("name is too long");

        if (iconId.HasValue && iconId.Value == Guid.Empty)
            return Error.Validation("iconId is invalid");

        if (iconId.HasValue && !await queryRepository.IconExistsAsync(iconId.Value, ct))
            return Error.Validation("icon not found");

        if (siteUrl?.Length > 512)
            return Error.Validation("siteUrl is too long");

        if (linkedinUrl?.Length > 512)
            return Error.Validation("linkedinUrl is too long");

        if (hrUrl?.Length > 512)
            return Error.Validation("hrUrl is too long");

        var exists = await queryRepository.CompanyExistsByNameAsync(
            normalizedName,
            exceptCompanyId,
            ct);

        return exists ? Error.Conflict("company already exists") : null;
    }

    private static AdminCompanyOperationModel MapCompany(AdminCompanyRepositoryModel company) =>
        new()
        {
            CompanyId = company.CompanyId,
            Name = company.Name,
            Description = company.Description,
            IconId = company.IconId,
            SiteUrl = company.SiteUrl,
            LinkedinUrl = company.LinkedinUrl,
            HrUrl = company.HrUrl,
            CreatedAt = ToDateTimeOffsetUtc(company.CreatedAtUtc),
            UpdatedAt = ToDateTimeOffsetUtc(company.UpdatedAtUtc)
        };

    private static CompanyRequestOperationModel MapCompanyRequest(CompanyRequestRepositoryModel request) =>
        new()
        {
            RequestId = request.RequestId,
            RequesterUserId = request.RequesterUserId,
            Name = request.Name,
            SiteUrl = request.SiteUrl,
            Status = request.Status,
            CreatedAt = ToDateTimeOffsetUtc(request.CreatedAtUtc),
            DecidedAt = request.DecidedAtUtc.HasValue
                ? ToDateTimeOffsetUtc(request.DecidedAtUtc.Value)
                : null,
            DecidedByUserId = request.DecidedByUserId
        };

    private static DateTimeOffset ToDateTimeOffsetUtc(DateTime value) =>
        value.Kind switch
        {
            DateTimeKind.Utc => new DateTimeOffset(value),
            DateTimeKind.Local => value.ToUniversalTime(),
            _ => new DateTimeOffset(DateTime.SpecifyKind(value, DateTimeKind.Utc))
        };
}
