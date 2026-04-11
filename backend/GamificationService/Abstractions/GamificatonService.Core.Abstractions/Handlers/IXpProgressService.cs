namespace GamificatonService.Core.Abstractions.Handlers;

public interface IXpProgressService
{
    Task HandleReviewWrittenAsync(
        Guid userId,
        string eventId,
        string aggregateId,
        DateTimeOffset occurredAt,
        CancellationToken ct);

    Task HandleReviewLikedAsync(
        Guid likedByUserId,
        Guid reviewAuthorId,
        string eventId,
        string aggregateId,
        DateTimeOffset occurredAt,
        CancellationToken ct);

    Task HandleUserSubscribedAsync(
        Guid subscriberUserId,
        Guid targetUserId,
        string eventId,
        string aggregateId,
        DateTimeOffset occurredAt,
        CancellationToken ct);
}