using AutoMapper;
using ReviewService.Core.Abstractions.Models.Reviews.GetUserReviews;
using ReviewService.Core.Abstractions.Observability;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Abstractions.Operations.Reviews;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews.GetUserReviews;
using ReviewService.PersistentStorage.Abstractions.Repositories.Reviews;
using ReviewService.PersistentStorage.Abstractions.Repositories.UserProfiles;
using System.Diagnostics;

namespace ReviewService.Core.Operations.Reviews;

internal sealed class GetUserReviewsOperation(
    IMapper mapper,
    IReviewsQueryRepository queryRepository,
    IUserProfilesQueryRepository userProfilesQueryRepository)
    : IGetUserReviewsOperation
{
    public async Task<Result<UserReviewsPageOperationModel>> GetAsync(
        GetUserReviewsOperationModel model,
        CancellationToken ct)
    {
        var stopwatch = Stopwatch.StartNew();
        var status = "success";

        try
        {
            if (model.UserId == Guid.Empty)
            {
                status = "validation";
                return Error.Validation("userId is required");
            }

            var repoInput = mapper.Map<GetUserReviewsRepositoryInputModel>(model);
            var repoOutput = await queryRepository.GetUserReviewsAsync(repoInput, ct);

            if (repoOutput is null)
            {
                status = "not_found";
                return Error.NotFound("user not found");
            }

            var iconId = await userProfilesQueryRepository.GetIconIdByUserIdAsync(model.UserId, ct);
            var ans = mapper.Map<UserReviewsPageOperationModel>(repoOutput);

            foreach (var review in ans.Reviews)
                review.AuthorIconId = iconId;

            return ans;
        }
        catch
        {
            status = "exception";
            ReviewMetrics.RecordOperationError("get_user_reviews", "core", "exception");
            throw;
        }
        finally
        {
            ReviewMetrics.RecordOperationDuration("get_user_reviews", "core", status, stopwatch.Elapsed.TotalMilliseconds);
        }
    }
}
