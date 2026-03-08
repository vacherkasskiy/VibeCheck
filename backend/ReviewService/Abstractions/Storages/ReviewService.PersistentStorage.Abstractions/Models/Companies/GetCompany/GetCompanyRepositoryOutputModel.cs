using ReviewService.PersistentStorage.Abstractions.Models.Shared;

namespace ReviewService.PersistentStorage.Abstractions.Models.Companies.GetCompany;

public sealed record GetCompanyRepositoryOutputModel
{
    public required Guid CompanyId { get; init; }
    public required string Name { get; init; }
    public required string IconId { get; init; }
    public required string Description { get; init; }
    public CompanyLinksRepositoryModel? Links { get; init; }
    public required IReadOnlyList<FlagCountRepositoryModel> TopFlags { get; set; }
}

public sealed record CompanyLinksRepositoryModel
{
    public string? Site { get; init; }
    public string? Linkedin { get; init; }
    public string? Hh { get; init; }
}