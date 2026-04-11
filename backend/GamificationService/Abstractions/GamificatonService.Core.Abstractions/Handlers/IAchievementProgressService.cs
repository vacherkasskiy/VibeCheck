namespace GamificatonService.Core.Abstractions.Handlers;

public interface IAchievementProgressService
{
    Task HandleReviewWrittenAsync(Guid userId, CancellationToken ct);
    Task HandleReviewLikedAsync(Guid likedByUserId, Guid reviewAuthorId, CancellationToken ct);
    Task HandleUserSubscribedAsync(Guid subscriberUserId, Guid targetUserId, CancellationToken ct);
    Task HandleReviewReportedAsync(Guid userId, CancellationToken ct);
}