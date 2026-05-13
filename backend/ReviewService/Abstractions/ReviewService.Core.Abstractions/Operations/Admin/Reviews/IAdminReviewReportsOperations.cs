using ReviewService.Core.Abstractions.Models.Admin.Reviews;
using ReviewService.Core.Abstractions.Models.Shared;

namespace ReviewService.Core.Abstractions.Operations.Admin.Reviews;

public interface IGetAdminReviewReportsOperation
{
    Task<Result<AdminReviewReportsPageOperationModel>> GetAsync(
        GetAdminReviewReportsOperationModel model,
        CancellationToken ct);
}
