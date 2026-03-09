using ReviewService.Core.Abstractions.Enums;

namespace ReviewService.Core.Abstractions.Models.Reviews;

public sealed record VoteReviewOperationModel
{
    public required Guid ReviewId { get; init; }
    public required Guid UserId { get; init; }
    public required VoteModeOperationEnum Mode { get; init; }
}