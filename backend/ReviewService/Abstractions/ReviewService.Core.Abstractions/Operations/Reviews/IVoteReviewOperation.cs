using ReviewService.Core.Abstractions.Enums;
using ReviewService.Core.Abstractions.Models.Reviews;
using ReviewService.Core.Abstractions.Models.Shared;

namespace ReviewService.Core.Abstractions.Operations.Reviews;

public interface IVoteReviewOperation
{
    Task<Result> VoteAsync(VoteReviewOperationModel model, CancellationToken ct);
}