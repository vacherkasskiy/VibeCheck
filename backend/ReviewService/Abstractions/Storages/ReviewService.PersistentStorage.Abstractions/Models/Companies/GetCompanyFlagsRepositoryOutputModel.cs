namespace ReviewService.PersistentStorage.Abstractions.Models.Companies;

public sealed record GetCompanyFlagsRepositoryOutputModel
{
    public required Guid CompanyId { get; init; }
    public required long TotalCount { get; init; }
    public required IReadOnlyList<CompanyFlagRepositoryModel> Flags { get; init; }
}