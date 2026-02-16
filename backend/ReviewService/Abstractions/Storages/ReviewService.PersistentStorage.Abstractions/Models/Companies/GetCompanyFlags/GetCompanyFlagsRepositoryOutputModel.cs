namespace ReviewService.PersistentStorage.Abstractions.Models.Companies.GetCompanyFlags;

public sealed record GetCompanyFlagsRepositoryOutputModel
{
    public required Guid CompanyId { get; init; }
    public required long TotalCount { get; init; }
    public required IReadOnlyList<CompanyFlagRepositoryModel> Flags { get; init; }
}

public sealed record CompanyFlagRepositoryModel
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required long Count { get; init; }
}