namespace ReviewService.Core.Abstractions.Models.Companies.CreateCompany;

public sealed record CreateCompanyOperationRequestModel
{
    public required Guid UserId { get; init; }
    public required string Name { get; init; }
    public string? Site { get; init; }
}