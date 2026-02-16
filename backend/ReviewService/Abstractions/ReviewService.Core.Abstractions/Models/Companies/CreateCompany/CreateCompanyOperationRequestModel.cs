namespace ReviewService.Core.Abstractions.Models.Companies.CreateCompany;

public sealed record CreateCompanyOperationRequestModel
{
    public required string Name { get; init; }
    public required string IconId { get; init; }
    public string? Site { get; init; }
}