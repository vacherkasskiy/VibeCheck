namespace ReviewService.PersistentStorage.Abstractions.Models.Companies;

public sealed record GetCompanyFlagsRepositoryInputModel
{
    public required Guid CompanyId { get; init; }
    public string? Q { get; init; }      // фильтр по названию флага
    public long Take { get; init; }      // 1..200
    public long PageNum { get; init; }   // >= 1
}