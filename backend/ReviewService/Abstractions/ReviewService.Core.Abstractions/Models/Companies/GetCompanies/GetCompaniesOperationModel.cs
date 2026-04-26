namespace ReviewService.Core.Abstractions.Models.Companies.GetCompanies;

public sealed record GetCompaniesOperationModel(
    string? Query,
    long Take,
    long PageNum,
    string? Q);