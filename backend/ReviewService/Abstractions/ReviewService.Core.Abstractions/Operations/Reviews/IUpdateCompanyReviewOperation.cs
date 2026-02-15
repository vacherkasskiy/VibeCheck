using ReviewService.Core.Abstractions.Models;
using ReviewService.Core.Abstractions.Models.Reviews.UpdateCompanyReview;
using ReviewService.Core.Abstractions.Models.Shared;

namespace ReviewService.Core.Abstractions.Operations.Reviews;

public interface IUpdateCompanyReviewOperation
{
    Task<Result> UpdateAsync(UpdateCompanyReviewOperationModel model, CancellationToken ct);
}