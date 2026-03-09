using ReviewService.PersistentStorage.Abstractions.Models.Reviews;

namespace ReviewService.PersistentStorage.Abstractions.Repositories.Reviews;

public interface IReviewsCommandRepository
{
    Task CreateReviewAsync(
        CreateReviewCommandRepositoryModel model,
        CancellationToken ct);

    Task UpdateReviewTextAsync(
        Guid reviewId,
        string? text,
        DateTime utcNow,
        CancellationToken ct);

    Task SoftDeleteReviewAsync(
        Guid reviewId,
        DateTime utcNow,
        CancellationToken ct);

    Task UpsertVoteAsync(
        UpsertReviewVoteCommandRepositoryModel model,
        CancellationToken ct);

    Task DeleteVoteAsync(
        Guid reviewId,
        Guid voterId,
        CancellationToken ct);

    Task RecalculateReviewScoreAsync(
        Guid reviewId,
        DateTime utcNow,
        CancellationToken ct);

    Task CreateReportAsync(
        CreateReviewReportCommandRepositoryModel model,
        CancellationToken ct);
}