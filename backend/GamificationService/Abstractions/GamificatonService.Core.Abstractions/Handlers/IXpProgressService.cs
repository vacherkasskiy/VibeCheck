namespace GamificatonService.Core.Abstractions.Handlers;

public interface IXpProgressService
{
    Task HandleReviewWrittenAsync(
        Guid userId,
        string eventId,
        string aggregateId,
        DateTimeOffset occurredAt,
        CancellationToken ct);

    Task HandleReviewUpdatedAsync(
        Guid userId,
        string eventId,
        string aggregateId,
        DateTimeOffset occurredAt,
        CancellationToken ct);

    Task HandleReviewReactedAsync(
        Guid reactedByUserId,
        Guid reviewAuthorId,
        string voteMode,
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
