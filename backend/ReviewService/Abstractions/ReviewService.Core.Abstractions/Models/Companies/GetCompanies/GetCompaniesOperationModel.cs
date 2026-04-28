namespace ReviewService.Core.Abstractions.Models.Companies.GetCompanies;

public sealed record GetCompaniesOperationModel(
    Guid CurrentUserId,
    string? Query,
    long Take,
    long PageNum,
    string? Q);
