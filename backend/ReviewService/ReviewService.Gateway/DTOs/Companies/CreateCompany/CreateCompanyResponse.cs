namespace ReviewService.Gateway.DTOs.Companies.CreateCompany;

public sealed record CreateCompanyResponse
{
    public required string RequestId { get; init; }
    public required string Status { get; init; } // "pending"
    public required DateTimeOffset CreatedAt { get; init; }
}