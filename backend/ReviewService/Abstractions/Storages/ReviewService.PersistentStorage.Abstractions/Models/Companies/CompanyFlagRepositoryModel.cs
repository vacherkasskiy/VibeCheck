namespace ReviewService.PersistentStorage.Abstractions.Models.Companies;

public sealed record CompanyFlagRepositoryModel
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required long Count { get; init; }
}