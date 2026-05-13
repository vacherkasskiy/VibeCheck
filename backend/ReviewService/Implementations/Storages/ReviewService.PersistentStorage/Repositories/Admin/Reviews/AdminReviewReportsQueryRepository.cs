using Microsoft.EntityFrameworkCore;
using ReviewService.PersistentStorage.Abstractions.Models.Admin.Reviews;
using ReviewService.PersistentStorage.Abstractions.Repositories.Admin.Reviews;

namespace ReviewService.PersistentStorage.Repositories.Admin.Reviews;

internal sealed class AdminReviewReportsQueryRepository(AppDbContext dbContext) : IAdminReviewReportsQueryRepository
{
    public async Task<AdminReviewReportsPageRepositoryModel> GetReportsAsync(
        GetAdminReviewReportsRepositoryInputModel input,
        CancellationToken ct)
    {
        var take = ClampInt(input.Take, 1, 100);
        var pageNum = Math.Max(1, input.PageNum);
        var skip = (pageNum - 1) * take;

        var query = dbContext.ReviewReports.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(input.ReasonType))
        {
            var reasonType = input.ReasonType.Trim();

            query = query.Where(x => EF.Functions.ILike(x.ReasonType, reasonType));
        }

        var totalCount = await query.LongCountAsync(ct);

        var reports = await query
            .OrderByDescending(x => x.CreatedAt)
            .ThenByDescending(x => x.Id)
            .Skip(skip)
            .Take(take)
            .Select(x => new AdminReviewReportRepositoryModel
            {
                ReportId = x.Id,
                ReviewId = x.ReviewId,
                ReporterId = x.ReporterId,
                ReasonType = x.ReasonType,
                ReasonText = x.ReasonText,
                CreatedAtUtc = x.CreatedAt,
                ReviewAuthorId = x.Review.AuthorId,
                CompanyId = x.Review.CompanyId,
                CompanyName = x.Review.Company.Name,
                ReviewText = x.Review.Text,
                ReviewCreatedAtUtc = x.Review.CreatedAt,
                ReviewDeletedAtUtc = x.Review.DeletedAt
            })
            .ToListAsync(ct);

        return new AdminReviewReportsPageRepositoryModel
        {
            TotalCount = totalCount,
            Reports = reports
        };
    }

    private static int ClampInt(int value, int min, int max) =>
        value < min ? min : value > max ? max : value;
}
