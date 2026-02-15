namespace ReviewService.Core.Abstractions.Enums;

public sealed record VoteReviewOperationModel
{
    public required Guid ReviewId { get; init; } // задаём в контроллере из route
    public required VoteModeOperationEnum ModeOperationEnum { get; init; }
}