using ReviewService.Core.Abstractions.Models.Shared;

namespace ReviewService.Core.Abstractions.Operations.Admin.Reviews;

public interface IAdminDeleteReviewOperation
{
    Task<Result> DeleteAsync(Guid reviewId, CancellationToken ct);
}
