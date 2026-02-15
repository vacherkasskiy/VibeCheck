namespace ReviewService.Core.Abstractions.Models.Companies.GetCompanyFlags;

public sealed record GetCompanyFlagsResultModel
{
    public required Guid CompanyId { get; init; }
    public required long TotalCount { get; init; }
    public required IReadOnlyList<FlagCountModel> Flags { get; init; }
}