using AutoMapper;
using ReviewService.Core.Abstractions.Models.Reviews.GetCompanyReviews;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Abstractions.Operations.Reviews;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews.GetCompanyReviews;
using ReviewService.PersistentStorage.Abstractions.Repositories.Reviews;
using ReviewService.PersistentStorage.Abstractions.Repositories.UserProfiles;

namespace ReviewService.Core.Operations.Reviews;

internal sealed class GetCompanyReviewsOperation(
    IMapper mapper,
    IReviewsQueryRepository queryRepository,
    IUserProfilesQueryRepository userProfilesQueryRepository)
    : IGetCompanyReviewsOperation
{
    public async Task<Result<CompanyReviewsPageOperationModel>> GetAsync(
        GetCompanyReviewsOperationModel model,
        CancellationToken ct)
    {
        // Guid не nullable, поэтому null проверка не нужна
        if (model.CompanyId == Guid.Empty)
            return Error.Validation("companyId is required");

        var repoInput = mapper.Map<GetCompanyReviewsRepositoryInputModel>(model);
        var repoOutput = await queryRepository.GetCompanyReviewsAsync(repoInput, ct);

        if (repoOutput is null)
            return Error.NotFound("company not found");

        var page = mapper.Map<CompanyReviewsPageOperationModel>(repoOutput);

        // собрать уникальные authorId и батчом подтянуть iconId
        var authorIds = page.Reviews
            .Select(r => r.AuthorId)
            .Where(id => id != Guid.Empty)
            .Distinct()
            .ToArray();

        if (authorIds.Length == 0)
            return page;

        var iconsByUserId = await userProfilesQueryRepository.GetIconIdsByUserIdsAsync(authorIds, ct);

        foreach (var review in page.Reviews)
        {
            if (review.AuthorId == Guid.Empty)
                continue;

            iconsByUserId.TryGetValue(review.AuthorId, out var iconId);
            review.AuthorIconId = iconId;
        }

        return page;
    }
}