using AutoMapper;
using Microsoft.EntityFrameworkCore;
using ReviewService.PersistentStorage.Abstractions.Models.Companies.GetCompanies;
using ReviewService.PersistentStorage.Abstractions.Models.Companies.GetCompany;
using ReviewService.PersistentStorage.Abstractions.Models.Companies.GetCompanyFlags;
using ReviewService.PersistentStorage.Abstractions.Models.Shared;
using ReviewService.PersistentStorage.Abstractions.Repositories.Companies;

namespace ReviewService.PersistentStorage.Repositories.Companies;

internal sealed class CompaniesQueryRepository(
    AppDbContext dbContext,
    IMapper mapper)
    : ICompaniesQueryRepository
{
    public Task<bool> CompanyExistsByNameAsync(
        string name,
        CancellationToken ct)
    {
        var normalizedName = name.Trim();

        return dbContext.Companies
            .AsNoTracking()
            .AnyAsync(
                x => EF.Functions.ILike(x.Name, normalizedName),
                ct);
    }

    public Task<bool> PendingCompanyRequestExistsByNameAsync(
        string name,
        CancellationToken ct)
    {
        var normalizedName = name.Trim();

        return dbContext.CompanyRequests
            .AsNoTracking()
            .AnyAsync(
                x => x.Status == "pending" &&
                     EF.Functions.ILike(x.Name, normalizedName),
                ct);
    }
    
    public async Task<GetCompaniesRepositoryOutputModel?> GetCompaniesAsync(
        GetCompaniesRepositoryInputModel input,
        CancellationToken ct)
    {
        var take = ClampLong(input.Take, 1, 100);
        var pageNum = Math.Max(1, input.PageNum);
        var skip = (pageNum - 1) * take;

        var query = dbContext.Companies
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(input.Query))
        {
            var search = input.Query.Trim();

            query = query.Where(x =>
                EF.Functions.ILike(x.Name, $"%{search}%") ||
                (x.Description != null && EF.Functions.ILike(x.Description, $"%{search}%")));
        }

        if (!string.IsNullOrWhiteSpace(input.Q))
        {
            var search = input.Q.Trim();

            query = query.Where(x =>
                EF.Functions.ILike(x.Name, $"%{search}%"));
        }

        var totalCount = await query.LongCountAsync(ct);

        var companies = await query
            .OrderByDescending(x => x.Weight)
            .ThenBy(x => x.Name)
            .Skip((int)skip)
            .Take((int)take)
            .Select(x => new
            {
                x.Id,
                x.Name,
                x.IconId,
                x.Weight
            })
            .ToListAsync(ct);

        var companyIds = companies
            .Select(x => x.Id)
            .ToArray();

        var topFlagsRaw = await dbContext.CompanyFlags
            .AsNoTracking()
            .Where(x => companyIds.Contains(x.CompanyId))
            .OrderByDescending(x => x.ReviewsCount)
            .ThenBy(x => x.Flag.Name)
            .Select(x => new
            {
                x.CompanyId,
                Flag = new FlagCountRepositoryModel
                {
                    Id = x.FlagId,
                    Name = x.Flag.Name,
                    Count = x.ReviewsCount
                }
            })
            .ToListAsync(ct);

        var topFlagsByCompanyId = topFlagsRaw
            .GroupBy(x => x.CompanyId)
            .ToDictionary(
                g => g.Key,
                g => (IReadOnlyList<FlagCountRepositoryModel>)g
                    .Take(5)
                    .Select(x => x.Flag)
                    .ToList());

        var resultCompanies = companies
            .Select(x => new CompanyListItemRepositoryModel
            {
                CompanyId = x.Id,
                Name = x.Name,
                IconId = x.IconId ?? string.Empty,
                Weight = x.Weight,
                TopFlags = topFlagsByCompanyId.GetValueOrDefault(x.Id, Array.Empty<FlagCountRepositoryModel>())
            })
            .ToList();

        return new GetCompaniesRepositoryOutputModel
        {
            TotalCount = totalCount,
            Companies = resultCompanies
        };
    }

    public async Task<GetCompanyRepositoryOutputModel?> GetCompanyAsync(
        GetCompanyRepositoryInputModel input,
        CancellationToken ct)
    {
        var company = await dbContext.Companies
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == input.CompanyId, ct);

        if (company is null)
            return null;

        var topFlags = await dbContext.CompanyFlags
            .AsNoTracking()
            .Where(x => x.CompanyId == input.CompanyId)
            .OrderByDescending(x => x.ReviewsCount)
            .ThenBy(x => x.Flag.Name)
            .Take(20)
            .Select(x => new FlagCountRepositoryModel
            {
                Id = x.FlagId,
                Name = x.Flag.Name,
                Count = x.ReviewsCount
            })
            .ToListAsync(ct);

        var output = mapper.Map<GetCompanyRepositoryOutputModel>(company);
        output.TopFlags = topFlags;

        return output;
    }

    public async Task<GetCompanyFlagsRepositoryOutputModel?> GetCompanyFlagsAsync(
        GetCompanyFlagsRepositoryInputModel input,
        CancellationToken ct)
    {
        var companyExists = await dbContext.Companies
            .AsNoTracking()
            .AnyAsync(x => x.Id == input.CompanyId, ct);

        if (!companyExists)
            return null;

        var take = ClampLong(input.Take, 1, 200);
        var pageNum = Math.Max(1, input.PageNum);
        var skip = (pageNum - 1) * take;

        var query = dbContext.CompanyFlags
            .AsNoTracking()
            .Where(x => x.CompanyId == input.CompanyId);

        if (!string.IsNullOrWhiteSpace(input.Q))
        {
            var search = input.Q.Trim();

            query = query.Where(x =>
                EF.Functions.ILike(x.Flag.Name, $"%{search}%"));
        }

        var totalCount = await query.LongCountAsync(ct);

        var flags = await query
            .OrderByDescending(x => x.ReviewsCount)
            .ThenBy(x => x.Flag.Name)
            .Skip((int)skip)
            .Take((int)take)
            .Select(x => new CompanyFlagRepositoryModel
            {
                Id = x.FlagId,
                Name = x.Flag.Name,
                Count = x.ReviewsCount
            })
            .ToListAsync(ct);

        return new GetCompanyFlagsRepositoryOutputModel
        {
            CompanyId = input.CompanyId,
            TotalCount = totalCount,
            Flags = flags
        };
    }

    private static long ClampLong(long value, long min, long max) =>
        value < min ? min : value > max ? max : value;
}