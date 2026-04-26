namespace ReviewService.Core.Abstractions.Models.Flags;

public sealed record GetAllFlagsOperationResultModel
{
    public required IReadOnlyList<FlagOperationModel> Flags { get; init; }
}

public sealed record FlagOperationModel
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required FlagCategoryOperationEnum Category { get; init; }
    public required string Description { get; init; }
}

public enum FlagCategoryOperationEnum
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