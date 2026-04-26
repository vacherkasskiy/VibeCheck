namespace ReviewService.Core.Abstractions.Models.Companies.GetCompanyFlags;

public sealed record GetCompanyFlagsOperationResultModel
{
    public required Guid CompanyId { get; init; }
    public required long TotalCount { get; init; }
    public required IReadOnlyList<CompanyFlagOperationModel> Flags { get; init; }
}