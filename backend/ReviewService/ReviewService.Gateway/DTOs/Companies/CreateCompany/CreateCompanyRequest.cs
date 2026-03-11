namespace ReviewService.Gateway.DTOs.Companies.CreateCompany;

public sealed record CreateCompanyRequest
{
    public required string Name { get; init; }
    public string? Site { get; init; }
}