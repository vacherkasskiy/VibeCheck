using ReviewService.PersistentStorage.Abstractions.Models.Companies.GetCompanies;
using ReviewService.PersistentStorage.Abstractions.Models.Companies.GetCompany;
using ReviewService.PersistentStorage.Abstractions.Models.Companies.GetCompanyFlags;
using ReviewService.PersistentStorage.Abstractions.Models.Shared;
using ReviewService.PersistentStorage.Abstractions.Repositories.Companies;

namespace ReviewService.PersistentStorage.Repositories.Companies;

/// <summary>
/// мок-репозиторий компаний: всё хардкодом, минимальная пагинация/фильтры.
/// </summary>
internal sealed class MockCompaniesQueryRepository : ICompaniesQueryRepository
{
    private static readonly List<CompanyRecord> Companies =
    [
        new(
            CompanyId: Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Name: "vibecheck labs",
            IconId: "ic_vibecheck",
            Description: "gen-z employer reviews platform",
            Links: new CompanyLinksRepositoryModel
            {
                Site = "https://vibecheck.example",
                Linkedin = null,
                Hh = null
            },
            Weight: 0.92),

        new(
            CompanyId: Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Name: "head-point",
            IconId: "ic_headpoint",
            Description: "backend products and integrations",
            Links: new CompanyLinksRepositoryModel
            {
                Site = "https://head-point.example",
                Linkedin = "https://linkedin.example/head-point",
                Hh = null
            },
            Weight: 0.81),

        new(
            CompanyId: Guid.Parse("33333333-3333-3333-3333-333333333333"),
            Name: "ozon",
            IconId: "ic_ozon",
            Description: "e-commerce marketplace",
            Links: new CompanyLinksRepositoryModel
            {
                Site = "https://ozon.example",
                Linkedin = "https://linkedin.example/ozon",
                Hh = "https://hh.example/ozon"
            },
            Weight: 0.77)
    ];

    private static readonly Dictionary<Guid, List<FlagCountRepositoryModel>> CompanyTopFlags = new()
    {
        [Guid.Parse("11111111-1111-1111-1111-111111111111")] =
        [
            new() { Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), Name = "культура", Count = 18 },
            new() { Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"), Name = "зарплата", Count = 12 },
            new() { Id = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc"), Name = "техстек", Count = 9 },
            new() { Id = Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddddddd"), Name = "процессы", Count = 6 },
            new() { Id = Guid.Parse("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"), Name = "офис", Count = 4 }
        ],
        [Guid.Parse("22222222-2222-2222-2222-222222222222")] =
        [
            new() { Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), Name = "культура", Count = 7 },
            new() { Id = Guid.Parse("ffffffff-ffff-ffff-ffff-ffffffffffff"), Name = "удалёнка", Count = 5 },
            new() { Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"), Name = "зарплата", Count = 4 },
            new() { Id = Guid.Parse("99999999-9999-9999-9999-999999999999"), Name = "менеджмент", Count = 3 }
        ],
        [Guid.Parse("33333333-3333-3333-3333-333333333333")] =
        [
            new() { Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"), Name = "зарплата", Count = 25 },
            new() { Id = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc"), Name = "техстек", Count = 17 },
            new() { Id = Guid.Parse("99999999-9999-9999-9999-999999999999"), Name = "менеджмент", Count = 14 },
            new() { Id = Guid.Parse("ffffffff-ffff-ffff-ffff-ffffffffffff"), Name = "удалёнка", Count = 10 },
            new() { Id = Guid.Parse("12121212-1212-1212-1212-121212121212"), Name = "бонусы", Count = 8 }
        ]
    };

    public Task<GetCompaniesRepositoryOutputModel?> GetCompaniesAsync(
        GetCompaniesRepositoryInputModel input,
        CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();

        IEnumerable<CompanyRecord> query = Companies;

        // query: подстрока в name или description
        if (!string.IsNullOrWhiteSpace(input.Query))
        {
            var s = input.Query.Trim();
            query = query.Where(x =>
                x.Name.Contains(s, StringComparison.OrdinalIgnoreCase) ||
                x.Description.Contains(s, StringComparison.OrdinalIgnoreCase));
        }

        // q: фильтр по названию (оставляю как отдельный фильтр)
        if (!string.IsNullOrWhiteSpace(input.Q))
        {
            var s = input.Q.Trim();
            query = query.Where(x => x.Name.Contains(s, StringComparison.OrdinalIgnoreCase));
        }

        // сортировка по весу (desc)
        query = query.OrderByDescending(x => x.Weight);

        var total = query.LongCount();

        var take = ClampLong(input.Take, 1, 100);
        var pageNum = Math.Max(1, input.PageNum);
        var skip = (pageNum - 1) * take;

        var page = query.Skip((int)skip).Take((int)take).ToList();

        var outCompanies = page.Select(c => new CompanyListItemRepositoryModel
        {
            CompanyId = c.CompanyId,
            Name = c.Name,
            IconId = c.IconId,
            Weight = c.Weight,
            TopFlags = GetTopFlags(c.CompanyId, max: 5)
        }).ToList();

        GetCompaniesRepositoryOutputModel output = new()
        {
            TotalCount = total,
            Companies = outCompanies
        };

        return Task.FromResult<GetCompaniesRepositoryOutputModel?>(output);
    }

    public Task<GetCompanyRepositoryOutputModel?> GetCompanyAsync(
        GetCompanyRepositoryInputModel input,
        CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();

        var company = Companies.FirstOrDefault(x => x.CompanyId == input.CompanyId);
        if (company is null)
            return Task.FromResult<GetCompanyRepositoryOutputModel?>(null);

        GetCompanyRepositoryOutputModel output = new()
        {
            CompanyId = company.CompanyId,
            Name = company.Name,
            IconId = company.IconId,
            Description = company.Description,
            Links = company.Links,
            TopFlags = GetTopFlags(company.CompanyId, max: 20)
        };

        return Task.FromResult<GetCompanyRepositoryOutputModel?>(output);
    }

    public Task<GetCompanyFlagsRepositoryOutputModel?> GetCompanyFlagsAsync(
        GetCompanyFlagsRepositoryInputModel input,
        CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();

        if (!CompanyTopFlags.TryGetValue(input.CompanyId, out var flags))
            return Task.FromResult<GetCompanyFlagsRepositoryOutputModel?>(null);

        IEnumerable<FlagCountRepositoryModel> query = flags
            .OrderByDescending(x => x.Count)
            .ThenBy(x => x.Name);

        if (!string.IsNullOrWhiteSpace(input.Q))
        {
            var s = input.Q.Trim();
            query = query.Where(x => x.Name.Contains(s, StringComparison.OrdinalIgnoreCase));
        }

        var total = query.LongCount();

        var take = ClampLong(input.Take, 1, 200);
        var pageNum = Math.Max(1, input.PageNum);
        var skip = (pageNum - 1) * take;

        var page = query.Skip((int)skip).Take((int)take).ToList();

        GetCompanyFlagsRepositoryOutputModel output = new()
        {
            CompanyId = input.CompanyId,
            TotalCount = total,
            Flags = page.Select(x => new CompanyFlagRepositoryModel
            {
                Id = x.Id,
                Name = x.Name,
                Count = x.Count
            }).ToList()
        };

        return Task.FromResult<GetCompanyFlagsRepositoryOutputModel?>(output);
    }

    private static IReadOnlyList<FlagCountRepositoryModel> GetTopFlags(Guid companyId, int max)
    {
        if (!CompanyTopFlags.TryGetValue(companyId, out var flags))
            return Array.Empty<FlagCountRepositoryModel>();

        return flags
            .OrderByDescending(x => x.Count)
            .ThenBy(x => x.Name)
            .Take(max)
            .ToList();
    }

    private static long ClampLong(long value, long min, long max) =>
        value < min ? min : value > max ? max : value;

    private sealed record CompanyRecord(
        Guid CompanyId,
        string Name,
        string IconId,
        string Description,
        CompanyLinksRepositoryModel? Links,
        double Weight);
}