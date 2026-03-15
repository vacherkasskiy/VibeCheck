namespace ReviewService.PersistentStorage.Abstractions.Models.Flags;

public sealed record GetAllFlagsRepositoryOutputModel
{
    public required IReadOnlyList<FlagRepositoryModel> Flags { get; init; }
}

public sealed record FlagRepositoryModel
{
    public required Guid Id { get; init; }
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