using AutoMapper;
using ReviewService.Core.Abstractions.Models.Reviews.GetUserReviews;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Abstractions.Operations.Reviews;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews.GetUserReviews;
using ReviewService.PersistentStorage.Abstractions.Repositories.Reviews;

namespace ReviewService.Core.Operations.Reviews;

internal sealed class GetUserReviewsOperation(
    IMapper mapper,
    IReviewsQueryRepository queryRepository)
    : IGetUserReviewsOperation
{
    public async Task<Result<UserReviewsPageOperationModel>> GetAsync(
        GetUserReviewsOperationModel model,
        CancellationToken ct)
    {
        var repoInput = mapper.Map<GetUserReviewsRepositoryInputModel>(model);
        var repoOutput = await queryRepository.GetUserReviewsAsync(repoInput, ct);

        if (repoOutput is null)
            return Error.NotFound("user not found");

        return mapper.Map<UserReviewsPageOperationModel>(repoOutput);
    }
}