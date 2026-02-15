namespace ReviewService.Core.Abstractions.Models.Companies.CreateCompany;

public sealed record CreateCompanyOperationResultModel
{
    public required string RequestId { get; init; }
    public required string Status { get; init; } // pending
    public required DateTimeOffset CreatedAt { get; init; }
}