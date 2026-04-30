namespace GamificatonService.Core.Abstractions.Handlers;

public interface IAchievementProgressService
{
    Task HandleReviewWrittenAsync(Guid userId, CancellationToken ct);
    Task HandleReviewUpdatedAsync(Guid userId, CancellationToken ct);
    Task HandleReviewReactedAsync(Guid reactedByUserId, Guid reviewAuthorId, string voteMode, CancellationToken ct);
    Task HandleUserSubscribedAsync(Guid subscriberUserId, Guid targetUserId, CancellationToken ct);
    Task HandleReviewReportedAsync(Guid userId, CancellationToken ct);
}
