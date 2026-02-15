namespace ReviewService.Core.Abstractions.Models.Companies.GetCompany;

public sealed record GetCompanyOperationResultModel
{
    public required Guid CompanyId { get; init; }
    public required string Name { get; init; }
    public required string IconId { get; init; }
    public required string Description { get; init; }
    public CompanyLinksModel? Links { get; init; }
    public required IReadOnlyList<FlagCountModel> TopFlags { get; init; } // max 20
}

public sealed record CompanyLinksModel
{
    public string? Site { get; init; }
    public string? Linkedin { get; init; }
    public string? Hh { get; init; }
}