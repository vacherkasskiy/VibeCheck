namespace ReviewService.PersistentStorage.Abstractions.Models.Companies.CreateCompany;

public sealed record CreateCompanyRequestRepositoryOutputModel
{
    public required Guid RequestId { get; init; }
    public required string Status { get; init; }
    public required DateTime CreatedAtUtc { get; init; }
}