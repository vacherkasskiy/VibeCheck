using ReviewService.Core.Abstractions.Enums;
using ReviewService.Core.Abstractions.Models.Reviews;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Abstractions.Operations.Reviews;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews;
using ReviewService.PersistentStorage.Abstractions.Repositories.Reviews;

namespace ReviewService.Core.Operations.Reviews;

internal sealed class VoteReviewOperation(
    IReviewsQueryRepository reviewsQueryRepository,
    IReviewsCommandRepository reviewsCommandRepository)
    : IVoteReviewOperation
{
    public async Task<Result> VoteAsync(
        VoteReviewOperationModel model,
        CancellationToken ct)
    {
        if (model.ReviewId == Guid.Empty)
            return Error.Validation("reviewId is required");

        if (model.UserId == Guid.Empty)
            return Error.Validation("userId is required");

        var review = await reviewsQueryRepository.GetReviewOwnershipAsync(model.ReviewId, ct);
        if (review is null)
            return Error.NotFound("review not found");

        if (review.IsDeleted)
            return Error.Validation("review deleted");

        if (review.AuthorId == model.UserId)
            return Error.Validation("cannot vote own review");

        if (model.Mode == VoteModeOperationEnum.Clear)
        {
            await reviewsCommandRepository.DeleteVoteAsync(model.ReviewId, model.UserId, ct);
            await reviewsCommandRepository.RecalculateReviewScoreAsync(model.ReviewId, DateTime.UtcNow, ct);

            return Result.Success();
        }

        var mode = model.Mode switch
        {
            VoteModeOperationEnum.Like => "like",
            VoteModeOperationEnum.Dislike => "dislike",
            _ => throw new ArgumentOutOfRangeException(nameof(model.Mode))
        };

        await reviewsCommandRepository.UpsertVoteAsync(
            new UpsertReviewVoteCommandRepositoryModel
            {
                ReviewId = model.ReviewId,
                VoterId = model.UserId,
                Mode = mode,
                UtcNow = DateTime.UtcNow
            },
            ct);

        await reviewsCommandRepository.RecalculateReviewScoreAsync(model.ReviewId, DateTime.UtcNow, ct);

        return Result.Success();
    }
}