namespace ReviewService.PersistentStorage.Abstractions.Models.Companies.CreateCompany;

public sealed record CreateCompanyRequestRepositoryInputModel
{
    public required Guid RequesterUserId { get; init; }
    public required string Name { get; init; }
    public required string IconId { get; init; }
    public string? SiteUrl { get; init; }
}