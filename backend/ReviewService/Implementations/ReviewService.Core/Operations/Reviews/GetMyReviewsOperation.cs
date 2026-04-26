using AutoMapper;
using ReviewService.Core.Abstractions.Models.Reviews.GetMyReviews;
using ReviewService.Core.Abstractions.Models.Reviews.GetUserReviews;
using ReviewService.Core.Abstractions.Observability;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Abstractions.Operations.Reviews;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews.GetMyReviews;
using ReviewService.PersistentStorage.Abstractions.Repositories.Reviews;
using ReviewService.PersistentStorage.Abstractions.Repositories.UserProfiles;
using System.Diagnostics;

namespace ReviewService.Core.Operations.Reviews;

internal sealed class GetMyReviewsOperation(
    IMapper mapper,
    IReviewsQueryRepository queryRepository,
    IUserProfilesQueryRepository userProfilesQueryRepository)
    : IGetMyReviewsOperation
{
    public async Task<Result<UserReviewsPageOperationModel>> GetAsync(
        GetMyReviewsOperationModel model,
        CancellationToken ct)
    {
        var stopwatch = Stopwatch.StartNew();
        var status = "success";

        try
        {
            if (model.CurrentUserId == Guid.Empty)
            {
                status = "validation";
                return Error.Validation("currentUserId is required");
            }

            var repoInput = mapper.Map<GetMyReviewsRepositoryInputModel>(model);
            var repoOutput = await queryRepository.GetMyReviewsAsync(repoInput, ct);

            if (repoOutput is null)
            {
                status = "failure";
                ReviewMetrics.RecordOperationError("get_my_reviews", "core", "repository_null");
                return Error.Failure("failed to load my reviews");
            }

            var iconId = await userProfilesQueryRepository.GetIconIdByUserIdAsync(model.CurrentUserId, ct);
            var ans = mapper.Map<UserReviewsPageOperationModel>(repoOutput);

            foreach (var review in ans.Reviews)
                review.AuthorIconId = iconId;

            return ans;
        }
        catch
        {
            status = "exception";
            ReviewMetrics.RecordOperationError("get_my_reviews", "core", "exception");
            throw;
        }
        finally
        {
            ReviewMetrics.RecordOperationDuration("get_my_reviews", "core", status, stopwatch.Elapsed.TotalMilliseconds);
        }
    }
}
