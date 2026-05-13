namespace ReviewService.PersistentStorage.Abstractions.Models.Admin.Flags;

public sealed record GetAdminFlagsRepositoryInputModel
{
    public string? Q { get; init; }
    public FlagCategoryRepositoryEnum? Category { get; init; }
    public int Take { get; init; }
    public int PageNum { get; init; }
}

public sealed record AdminFlagsPageRepositoryModel
{
    public required long TotalCount { get; init; }
    public required IReadOnlyList<AdminFlagRepositoryModel> Flags { get; init; }
}

public sealed record AdminFlagRepositoryModel
{
    public required Guid FlagId { get; init; }
    public required string Name { get; init; }
    public required FlagCategoryRepositoryEnum Category { get; init; }
    public required string Description { get; init; }
    public required DateTime CreatedAtUtc { get; init; }
}

public sealed record UpsertAdminFlagRepositoryModel
{
    public required string Name { get; init; }
    public required FlagCategoryRepositoryEnum Category { get; init; }
    public required string Description { get; init; }
}

public enum FlagCategoryRepositoryEnum
{
    Culture = 0,
    Management = 1,
    Processes = 2,
    Communications = 3,
    Image = 4,
    Compensation = 5,
    Career = 6,
    Balance = 7,
    Conditions = 8,
    Values = 9
}
