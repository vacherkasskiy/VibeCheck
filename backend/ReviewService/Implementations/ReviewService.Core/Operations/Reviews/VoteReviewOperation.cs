using ReviewService.Core.Abstractions.Enums;
using ReviewService.Core.Abstractions.Models.Reviews;
using ReviewService.Core.Abstractions.Observability;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Abstractions.Operations.Reviews;
using ReviewService.MessageBroker.Abstractions.Producers;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews;
using ReviewService.PersistentStorage.Abstractions.Repositories.Reviews;
using System.Diagnostics;

namespace ReviewService.Core.Operations.Reviews;

internal sealed class VoteReviewOperation(
    IReviewsQueryRepository reviewsQueryRepository,
    IReviewsCommandRepository reviewsCommandRepository,
    IReviewLikesEventsProducer likesEventsProducer)
    : IVoteReviewOperation
{
    public async Task<Result> VoteAsync(
        VoteReviewOperationModel model,
        CancellationToken ct)
    {
        var stopwatch = Stopwatch.StartNew();
        var status = "success";
        var modeLabel = model.Mode.ToString().ToLowerInvariant();

        try
        {
            if (model.ReviewId == Guid.Empty)
            {
                status = "validation";
                return Error.Validation("reviewId is required");
            }

            if (model.UserId == Guid.Empty)
            {
                status = "validation";
                return Error.Validation("userId is required");
            }

            var review = await reviewsQueryRepository.GetReviewOwnershipWithCompanyInfoAsync(model.ReviewId, ct);
            if (review is null)
            {
                status = "not_found";
                return Error.NotFound("review not found");
            }

            if (review.IsDeleted)
            {
                status = "validation";
                return Error.Validation("review deleted");
            }

            if (review.AuthorId == model.UserId)
            {
                status = "validation";
                return Error.Validation("cannot vote own review");
            }

            if (model.Mode == VoteModeOperationEnum.Clear)
            {
                await reviewsCommandRepository.DeleteVoteAsync(model.ReviewId, model.UserId, ct);
                await reviewsCommandRepository.RecalculateReviewScoreAsync(model.ReviewId, DateTime.UtcNow, ct);
                ReviewMetrics.RecordVote("clear", "success");
                return Result.Success();
            }

            var mode = model.Mode switch
            {
                VoteModeOperationEnum.Like => "like",
                VoteModeOperationEnum.Dislike => "dislike",
                _ => throw new ArgumentOutOfRangeException(nameof(model.Mode))
            };

            modeLabel = mode;

            var vote = new UpsertReviewVoteCommandRepositoryModel
            {
                ReviewId = model.ReviewId,
                VoterId = model.UserId,
                Mode = mode,
                UtcNow = DateTime.UtcNow
            };

            var currentVoteMode = await reviewsQueryRepository.GetReviewVoteModeAsync(
                model.ReviewId,
                model.UserId,
                ct);

            if (string.Equals(currentVoteMode, mode, StringComparison.OrdinalIgnoreCase))
            {
                status = "validation";
                ReviewMetrics.RecordVote(modeLabel, "validation");
                return Error.Validation("review already voted");
            }

            var isNewVote = await reviewsCommandRepository.UpsertVoteAsync(vote, ct);
            await reviewsCommandRepository.RecalculateReviewScoreAsync(model.ReviewId, DateTime.UtcNow, ct);

            if (isNewVote)
            {
                await likesEventsProducer.PublishReviewLikedAsync(
                    model.UserId,
                    vote.ReviewId,
                    review.AuthorId,
                    review.CompanyId,
                    review.CompanyName,
                    mode,
                    vote.UtcNow,
                    ct);
            }

            ReviewMetrics.RecordVote(modeLabel, "success");

            return Result.Success();
        }
        catch
        {
            status = "exception";
            ReviewMetrics.RecordOperationError("vote_review", "core", "exception");
            throw;
        }
        finally
        {
            ReviewMetrics.RecordOperationDuration("vote_review", "core", status, stopwatch.Elapsed.TotalMilliseconds);
        }
    }
}
