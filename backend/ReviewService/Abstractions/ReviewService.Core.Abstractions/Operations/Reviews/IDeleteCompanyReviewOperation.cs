using ReviewService.Core.Abstractions.Models.Reviews.DeleteCompanyReview;
using ReviewService.Core.Abstractions.Models.Shared;

namespace ReviewService.Core.Abstractions.Operations.Reviews;

public interface IDeleteCompanyReviewOperation
{
    Task<Result> DeleteAsync(DeleteCompanyReviewOperationModel model, CancellationToken ct);
}