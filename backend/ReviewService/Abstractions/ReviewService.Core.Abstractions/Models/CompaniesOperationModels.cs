namespace ReviewService.Core.Abstractions.Models;

// -------------------------
// operation models (input)
// -------------------------

public sealed record GetCompaniesOperationModel(
    string? Query,
    long Take,
    long PageNum,
    string? Q);

public sealed record GetCompanyFlagsOperationModel(
    Guid CompanyId,
    string? Q,
    long Take,
    long PageNum);

public sealed record CreateCompanyRequestOperationModel
{
    public required string Name { get; init; }
    public required string IconId { get; init; }
    public string? Site { get; init; }
}

// -------------------------
// result models (output)
// -------------------------

public sealed record GetCompaniesResultModel
{
    public required long TotalCount { get; init; }
    public required IReadOnlyList<CompanyListItemModel> Companies { get; init; }
}

public sealed record CompanyListItemModel
{
    public required Guid CompanyId { get; init; }
    public required string Name { get; init; }
    public required string IconId { get; init; }
    public required double Weight { get; init; }
    public required IReadOnlyList<FlagCountModel> TopFlags { get; init; } // max 5
}

public sealed record GetCompanyResultModel
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

public sealed record GetCompanyFlagsResultModel
{
    public required Guid CompanyId { get; init; }
    public required long TotalCount { get; init; }
    public required IReadOnlyList<FlagCountModel> Flags { get; init; }
}

public sealed record FlagCountModel
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required long Count { get; init; }
}

public sealed record CreateCompanyRequestResultModel
{
    public required string RequestId { get; init; }
    public required string Status { get; init; } // pending
    public required DateTimeOffset CreatedAt { get; init; }
}