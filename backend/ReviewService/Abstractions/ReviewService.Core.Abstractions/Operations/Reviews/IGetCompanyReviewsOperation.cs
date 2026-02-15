using ReviewService.Core.Abstractions.Models.Reviews.GetCompanyReviews;
using ReviewService.Core.Abstractions.Models.Shared;

namespace ReviewService.Core.Abstractions.Operations.Reviews;

public interface IGetCompanyReviewsOperation
{
    Task<Result<CompanyReviewsPageOperationModel>> GetAsync(GetCompanyReviewsOperationModel model, CancellationToken ct);
}