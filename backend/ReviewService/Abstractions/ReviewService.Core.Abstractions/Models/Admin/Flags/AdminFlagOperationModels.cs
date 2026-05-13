using ReviewService.Core.Abstractions.Models.Flags;

namespace ReviewService.Core.Abstractions.Models.Admin.Flags;

public sealed record GetAdminFlagsOperationModel(
    string? Q,
    FlagCategoryOperationEnum? Category,
    int Take,
    int PageNum);

public sealed record AdminFlagsPageOperationModel
{
    public required long TotalCount { get; init; }
    public required IReadOnlyList<AdminFlagOperationModel> Flags { get; init; }
}

public sealed record AdminFlagOperationModel
{
    public required Guid FlagId { get; init; }
    public required string Name { get; init; }
    public required FlagCategoryOperationEnum Category { get; init; }
    public required string Description { get; init; }
    public required DateTimeOffset CreatedAt { get; init; }
}

public sealed record CreateAdminFlagOperationModel
{
    public required string Name { get; init; }
    public required FlagCategoryOperationEnum Category { get; init; }
    public required string Description { get; init; }
}

public sealed record UpdateAdminFlagOperationModel
{
    public required Guid FlagId { get; init; }
    public required string Name { get; init; }
    public required FlagCategoryOperationEnum Category { get; init; }
    public required string Description { get; init; }
}
