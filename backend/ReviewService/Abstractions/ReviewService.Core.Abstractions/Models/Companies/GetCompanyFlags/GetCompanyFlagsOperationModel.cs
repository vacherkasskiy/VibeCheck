namespace ReviewService.Core.Abstractions.Models.Companies.GetCompanyFlags;

public sealed record GetCompanyFlagsOperationModel(
    Guid CompanyId,
    string? Q,
    long Take,
    long PageNum);