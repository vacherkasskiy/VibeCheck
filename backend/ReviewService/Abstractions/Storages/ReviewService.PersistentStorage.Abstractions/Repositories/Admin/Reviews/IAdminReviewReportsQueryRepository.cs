using ReviewService.PersistentStorage.Abstractions.Models.Admin.Reviews;

namespace ReviewService.PersistentStorage.Abstractions.Repositories.Admin.Reviews;

public interface IAdminReviewReportsQueryRepository
{
    Task<AdminReviewReportsPageRepositoryModel> GetReportsAsync(
        GetAdminReviewReportsRepositoryInputModel input,
        CancellationToken ct);
}
