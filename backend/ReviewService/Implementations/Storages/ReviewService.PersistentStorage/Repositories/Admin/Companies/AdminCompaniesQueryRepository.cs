using Microsoft.EntityFrameworkCore;
using ReviewService.PersistentStorage.Abstractions.Models.Admin.Companies;
using ReviewService.PersistentStorage.Abstractions.Repositories.Admin.Companies;

namespace ReviewService.PersistentStorage.Repositories.Admin.Companies;

internal sealed class AdminCompaniesQueryRepository(AppDbContext dbContext) : IAdminCompaniesQueryRepository
{
    public async Task<AdminCompaniesPageRepositoryModel> GetCompaniesAsync(
        GetAdminCompaniesRepositoryInputModel input,
        CancellationToken ct)
    {
        var take = ClampInt(input.Take, 1, 100);
        var pageNum = Math.Max(1, input.PageNum);
        var skip = (pageNum - 1) * take;

        var query = dbContext.Companies.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(input.Q))
        {
            var search = input.Q.Trim();

            query = query.Where(x =>
                EF.Functions.ILike(x.Name, $"%{search}%") ||
                (x.Description != null && EF.Functions.ILike(x.Description, $"%{search}%")));
        }

        var totalCount = await query.LongCountAsync(ct);

        var companies = await query
            .OrderBy(x => x.Name)
            .ThenBy(x => x.Id)
            .Skip(skip)
            .Take(take)
            .Select(x => new AdminCompanyRepositoryModel
            {
                CompanyId = x.Id,
                Name = x.Name,
                Description = x.Description,
                IconId = x.IconId,
                SiteUrl = x.SiteUrl,
                LinkedinUrl = x.LinkedinUrl,
                HrUrl = x.HrUrl,
                CreatedAtUtc = x.CreatedAt,
                UpdatedAtUtc = x.UpdatedAt
            })
            .ToListAsync(ct);

        return new AdminCompaniesPageRepositoryModel
        {
            TotalCount = totalCount,
            Companies = companies
        };
    }

    public Task<AdminCompanyRepositoryModel?> GetCompanyAsync(Guid companyId, CancellationToken ct) =>
        dbContext.Companies
            .AsNoTracking()
            .Where(x => x.Id == companyId)
            .Select(x => new AdminCompanyRepositoryModel
            {
                CompanyId = x.Id,
                Name = x.Name,
                Description = x.Description,
                IconId = x.IconId,
                SiteUrl = x.SiteUrl,
                LinkedinUrl = x.LinkedinUrl,
                HrUrl = x.HrUrl,
                CreatedAtUtc = x.CreatedAt,
                UpdatedAtUtc = x.UpdatedAt
            })
            .FirstOrDefaultAsync(ct);

    public async Task<CompanyRequestsPageRepositoryModel> GetCompanyRequestsAsync(
        GetCompanyRequestsRepositoryInputModel input,
        CancellationToken ct)
    {
        var take = ClampInt(input.Take, 1, 100);
        var pageNum = Math.Max(1, input.PageNum);
        var skip = (pageNum - 1) * take;

        var query = dbContext.CompanyRequests.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(input.Status))
        {
            var status = input.Status.Trim();

            query = query.Where(x => EF.Functions.ILike(x.Status, status));
        }

        if (!string.IsNullOrWhiteSpace(input.Q))
        {
            var search = input.Q.Trim();

            query = query.Where(x => EF.Functions.ILike(x.Name, $"%{search}%"));
        }

        var totalCount = await query.LongCountAsync(ct);

        var requests = await query
            .OrderByDescending(x => x.CreatedAt)
            .ThenByDescending(x => x.Id)
            .Skip(skip)
            .Take(take)
            .Select(x => new CompanyRequestRepositoryModel
            {
                RequestId = x.Id,
                RequesterUserId = x.RequesterUserId,
                Name = x.Name,
                SiteUrl = x.SiteUrl,
                Status = x.Status,
                CreatedAtUtc = x.CreatedAt,
                DecidedAtUtc = x.DecidedAt,
                DecidedByUserId = x.DecidedByUserId
            })
            .ToListAsync(ct);

        return new CompanyRequestsPageRepositoryModel
        {
            TotalCount = totalCount,
            Requests = requests
        };
    }

    public Task<bool> CompanyExistsByNameAsync(
        string name,
        Guid? exceptCompanyId,
        CancellationToken ct)
    {
        var normalizedName = name.Trim();

        return dbContext.Companies
            .AsNoTracking()
            .AnyAsync(
                x => EF.Functions.ILike(x.Name, normalizedName) &&
                     (!exceptCompanyId.HasValue || x.Id != exceptCompanyId.Value),
                ct);
    }

    public Task<bool> IconExistsAsync(Guid iconId, CancellationToken ct) =>
        dbContext.Icons
            .AsNoTracking()
            .AnyAsync(x => x.Id == iconId, ct);

    public Task<bool> CompanyHasReviewsAsync(Guid companyId, CancellationToken ct) =>
        dbContext.Reviews
            .AsNoTracking()
            .AnyAsync(x => x.CompanyId == companyId, ct);

    private static int ClampInt(int value, int min, int max) =>
        value < min ? min : value > max ? max : value;
}
