namespace ReviewService.Gateway.DTOs.Flags;

public sealed record GetAllFlagsResponse
{
    public required IReadOnlyList<GetAllFlagsItemDto> Flags { get; init; }
}

public sealed record GetAllFlagsItemDto
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required FlagCategoryDtoEnum Category { get; init; }
    public required string Description { get; init; }
}

public enum FlagCategoryDtoEnum
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