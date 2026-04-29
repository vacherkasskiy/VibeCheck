namespace ReviewService.MessageBroker.Abstractions.Producers;

public interface IReviewLikesEventsProducer
{
    Task PublishReviewLikedAsync(
        Guid likedByUserId,
        Guid reviewId,
        Guid reviewAuthorId,
        Guid reviewCompanyId,
        string reviewCompanyName,
        string voteMode,
        DateTimeOffset createdAt,
        CancellationToken ct);
}
