namespace ReviewService.Admin.Api.DTOs.Flags;

public sealed record GetFlagsResponse
{
    public required long TotalCount { get; init; }
    public required IReadOnlyList<AdminFlagDto> Flags { get; init; }
}

public sealed record AdminFlagDto
{
    public required Guid FlagId { get; init; }
    public required string Name { get; init; }
    public required FlagCategoryDtoEnum Category { get; init; }
    public required string Description { get; init; }
    public required DateTimeOffset CreatedAt { get; init; }
}

public sealed record CreateFlagRequest
{
    public required string Name { get; init; }
    public required FlagCategoryDtoEnum Category { get; init; }
    public required string Description { get; init; }
}

public sealed record UpdateFlagRequest
{
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
