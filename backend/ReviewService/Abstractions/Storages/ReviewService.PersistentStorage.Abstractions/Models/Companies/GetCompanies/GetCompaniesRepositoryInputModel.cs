namespace ReviewService.PersistentStorage.Abstractions.Models.Companies.GetCompanies;

public sealed record GetCompaniesRepositoryInputModel
{
    public string? Query { get; init; }   // поиск по названию/описанию
    public string? Q { get; init; }       // доп. фильтр по названию (как в спеках)
    public long Take { get; init; }       // 1..100
    public long PageNum { get; init; }    // >= 1
}