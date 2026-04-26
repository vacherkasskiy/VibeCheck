namespace ReviewService.Core.Abstractions.Models.Companies.GetCompany;

public sealed record GetCompanyOperationResultModel
{
    public required Guid CompanyId { get; init; }
    public required string Name { get; init; }
    public required string IconUrl { get; init; }
    public required string Description { get; init; }
    public CompanyLinksOperationModel? Links { get; init; }
    public required IReadOnlyList<CompanyFlagOperationModel> TopFlags { get; init; } // max 20
}

public sealed record CompanyLinksOperationModel
{
    public string? Site { get; init; }
    public string? Linkedin { get; init; }
    public string? Hh { get; init; }
}