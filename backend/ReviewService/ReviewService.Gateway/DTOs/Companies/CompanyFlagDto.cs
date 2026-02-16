namespace ReviewService.Gateway.DTOs.Companies;

public sealed record CompanyFlagDto
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required long Count { get; init; }
}