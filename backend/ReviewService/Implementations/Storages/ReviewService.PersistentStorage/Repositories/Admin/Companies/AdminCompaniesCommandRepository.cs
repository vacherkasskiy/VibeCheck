using Microsoft.EntityFrameworkCore;
using ReviewService.PersistentStorage.Abstractions.Models.Admin.Companies;
using ReviewService.PersistentStorage.Abstractions.Repositories.Admin.Companies;
using ReviewService.PersistentStorage.Entities;

namespace ReviewService.PersistentStorage.Repositories.Admin.Companies;

internal sealed class AdminCompaniesCommandRepository(AppDbContext dbContext) : IAdminCompaniesCommandRepository
{
    public async Task<AdminCompanyRepositoryModel> CreateAsync(
        UpsertAdminCompanyRepositoryModel model,
        DateTime utcNow,
        CancellationToken ct)
    {
        var company = new CompanyEntity
        {
            Id = Guid.NewGuid(),
            Name = model.Name.Trim(),
            Description = NormalizeNullable(model.Description),
            IconId = model.IconId,
            SiteUrl = NormalizeNullable(model.SiteUrl),
            LinkedinUrl = NormalizeNullable(model.LinkedinUrl),
            HrUrl = NormalizeNullable(model.HrUrl),
            CreatedAt = utcNow,
            UpdatedAt = utcNow
        };

        dbContext.Companies.Add(company);
        await dbContext.SaveChangesAsync(ct);

        return Map(company);
    }

    public async Task<AdminCompanyRepositoryModel?> UpdateAsync(
        Guid companyId,
        UpsertAdminCompanyRepositoryModel model,
        DateTime utcNow,
        CancellationToken ct)
    {
        var company = await dbContext.Companies
            .FirstOrDefaultAsync(x => x.Id == companyId, ct);

        if (company is null)
            return null;

        company.Name = model.Name.Trim();
        company.Description = NormalizeNullable(model.Description);
        company.IconId = model.IconId;
        company.SiteUrl = NormalizeNullable(model.SiteUrl);
        company.LinkedinUrl = NormalizeNullable(model.LinkedinUrl);
        company.HrUrl = NormalizeNullable(model.HrUrl);
        company.UpdatedAt = utcNow;

        await dbContext.SaveChangesAsync(ct);

        return Map(company);
    }

    public async Task DeleteAsync(Guid companyId, CancellationToken ct)
    {
        var company = await dbContext.Companies
            .FirstAsync(x => x.Id == companyId, ct);

        dbContext.Companies.Remove(company);
        await dbContext.SaveChangesAsync(ct);
    }

    private static AdminCompanyRepositoryModel Map(CompanyEntity company) =>
        new()
        {
            CompanyId = company.Id,
            Name = company.Name,
            Description = company.Description,
            IconId = company.IconId,
            SiteUrl = company.SiteUrl,
            LinkedinUrl = company.LinkedinUrl,
            HrUrl = company.HrUrl,
            CreatedAtUtc = company.CreatedAt,
            UpdatedAtUtc = company.UpdatedAt
        };

    private static string? NormalizeNullable(string? value)
    {
        var normalized = value?.Trim();

        return string.IsNullOrWhiteSpace(normalized) ? null : normalized;
    }
}
