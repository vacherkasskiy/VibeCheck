using ReviewService.Core.Abstractions.Models.Admin.Reviews;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Abstractions.Operations.Admin.Reviews;
using ReviewService.PersistentStorage.Abstractions.Models.Admin.Reviews;
using ReviewService.PersistentStorage.Abstractions.Repositories.Admin.Reviews;
using ReviewService.PersistentStorage.Abstractions.Repositories.Reviews;

namespace ReviewService.Core.Operations.Admin.Reviews;

internal sealed class AdminReviewReportsOperations(
    IAdminReviewReportsQueryRepository queryRepository,
    IReviewsQueryRepository reviewsQueryRepository,
    IReviewsCommandRepository reviewsCommandRepository)
    : IGetAdminReviewReportsOperation,
        IAdminDeleteReviewOperation
{
    public async Task<Result<AdminReviewReportsPageOperationModel>> GetAsync(
        GetAdminReviewReportsOperationModel model,
        CancellationToken ct)
    {
        var repoResult = await queryRepository.GetReportsAsync(
            new GetAdminReviewReportsRepositoryInputModel
            {
                ReasonType = model.ReasonType,
                Take = model.Take,
                PageNum = model.PageNum
            },
            ct);

        return new AdminReviewReportsPageOperationModel
        {
            TotalCount = repoResult.TotalCount,
            Reports = repoResult.Reports.Select(MapReport).ToArray()
        };
    }

    public async Task<Result> DeleteAsync(Guid reviewId, CancellationToken ct)
    {
        if (reviewId == Guid.Empty)
            return Error.Validation("reviewId is required");

        var review = await reviewsQueryRepository.GetReviewOwnershipAsync(reviewId, ct);

        if (review is null)
            return Error.NotFound("review not found");

        if (review.IsDeleted)
            return Result.Success();

        await reviewsCommandRepository.SoftDeleteReviewAsync(reviewId, DateTime.UtcNow, ct);

        return Result.Success();
    }

    private static AdminReviewReportOperationModel MapReport(AdminReviewReportRepositoryModel report) =>
        new()
        {
            ReportId = report.ReportId,
            ReviewId = report.ReviewId,
            ReporterId = report.ReporterId,
            ReasonType = report.ReasonType,
            ReasonText = report.ReasonText,
            CreatedAt = ToDateTimeOffsetUtc(report.CreatedAtUtc),
            ReviewAuthorId = report.ReviewAuthorId,
            CompanyId = report.CompanyId,
            CompanyName = report.CompanyName,
            ReviewText = report.ReviewText,
            ReviewCreatedAt = ToDateTimeOffsetUtc(report.ReviewCreatedAtUtc),
            ReviewDeletedAt = report.ReviewDeletedAtUtc.HasValue
                ? ToDateTimeOffsetUtc(report.ReviewDeletedAtUtc.Value)
                : null
        };

    private static DateTimeOffset ToDateTimeOffsetUtc(DateTime value) =>
        value.Kind switch
        {
            DateTimeKind.Utc => new DateTimeOffset(value),
            DateTimeKind.Local => value.ToUniversalTime(),
            _ => new DateTimeOffset(DateTime.SpecifyKind(value, DateTimeKind.Utc))
        };
}
