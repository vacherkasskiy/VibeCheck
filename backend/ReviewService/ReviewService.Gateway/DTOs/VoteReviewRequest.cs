namespace ReviewService.Gateway.DTOs;

public sealed record VoteReviewRequest
{
    public required VoteModeGatewayEnum Mode { get; init; }
}

public enum VoteModeGatewayEnum
{
    Like = 0,
    Dislike = 1,
    Clear = 2
}