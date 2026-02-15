namespace ReviewService.Core.Abstractions.Models.Reviews;

public sealed record FlagReadOperationModel
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
}