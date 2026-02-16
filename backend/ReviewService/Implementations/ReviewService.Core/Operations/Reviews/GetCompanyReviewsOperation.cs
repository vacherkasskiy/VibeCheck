using AutoMapper;
using ReviewService.Core.Abstractions.Models.Reviews.GetCompanyReviews;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Abstractions.Operations.Reviews;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews.GetCompanyReviews;
using ReviewService.PersistentStorage.Abstractions.Repositories.Reviews;

namespace ReviewService.Core.Operations.Reviews;

internal sealed class GetCompanyReviewsOperation(
    IMapper mapper,
    IReviewsQueryRepository queryRepository)
    : IGetCompanyReviewsOperation
{
    public async Task<Result<CompanyReviewsPageOperationModel>> GetAsync(
        GetCompanyReviewsOperationModel model,
        CancellationToken ct)
    {
        var repoInput = mapper.Map<GetCompanyReviewsRepositoryInputModel>(model);
        var repoOutput = await queryRepository.GetCompanyReviewsAsync(repoInput, ct);

        if (repoOutput is null)
            return Error.NotFound("company not found");

        return mapper.Map<CompanyReviewsPageOperationModel>(repoOutput);
    }
}