using AutoMapper;
using ReviewService.Core.Abstractions.Models.Reviews.GetMyReviews;
using ReviewService.Core.Abstractions.Models.Reviews.GetUserReviews;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Abstractions.Operations.Reviews;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews.GetMyReviews;
using ReviewService.PersistentStorage.Abstractions.Repositories.Reviews;

namespace ReviewService.Core.Operations.Reviews;

internal sealed class GetMyReviewsOperation(
    IMapper mapper,
    IReviewsQueryRepository queryRepository)
    : IGetMyReviewsOperation
{
    public async Task<Result<UserReviewsPageOperationModel>> GetAsync(
        GetMyReviewsOperationModel model,
        CancellationToken ct)
    {
        if (model.CurrentUserId == Guid.Empty)
            return Error.Validation("currentUserId is required");

        var repoInput = mapper.Map<GetMyReviewsRepositoryInputModel>(model);
        var repoOutput = await queryRepository.GetMyReviewsAsync(repoInput, ct);

        // для "me" 404 не заявлен, null трактуем как internal failure
        if (repoOutput is null)
            return Error.Failure("failed to load my reviews");

        return mapper.Map<UserReviewsPageOperationModel>(repoOutput);
    }
}