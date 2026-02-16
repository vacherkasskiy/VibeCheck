using ReviewService.Core.Abstractions.Models.Reviews.CreateCompanyReview;
using ReviewService.Core.Abstractions.Models.Shared;

namespace ReviewService.Core.Abstractions.Operations.Reviews;

public interface ICreateCompanyReviewOperation
{
    Task<Result> CreateAsync(CreateCompanyReviewOperationModel model, CancellationToken ct);
}