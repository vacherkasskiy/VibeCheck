using ReviewService.Core.Abstractions.Models.Reviews.ReportReview;
using ReviewService.Core.Abstractions.Models.Shared;

namespace ReviewService.Core.Abstractions.Operations.Reviews;

public interface IReportReviewOperation
{
    Task<Result> ReportAsync(ReportReviewOperationModel model, CancellationToken ct);
}