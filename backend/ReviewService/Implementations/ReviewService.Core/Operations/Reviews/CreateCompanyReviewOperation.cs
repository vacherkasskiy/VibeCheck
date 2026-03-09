using ReviewService.Core.Abstractions.Models.Reviews.CreateCompanyReview;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Abstractions.Operations.Reviews;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews;
using ReviewService.PersistentStorage.Abstractions.Repositories.Reviews;

namespace ReviewService.Core.Operations.Reviews;

internal sealed class CreateCompanyReviewOperation(
    IReviewsQueryRepository reviewsQueryRepository,
    IReviewsCommandRepository reviewsCommandRepository)
    : ICreateCompanyReviewOperation
{
    public async Task<Result> CreateAsync(
        CreateCompanyReviewOperationModel model,
        CancellationToken ct)
    {
        if (model.UserId == Guid.Empty)
            return Error.Validation("userId is required");

        if (model.CompanyId == Guid.Empty)
            return Error.Validation("companyId is required");

        if (model.Flags is null || model.Flags.Length == 0)
            return Error.Validation("flags are required");

        if (model.Flags.Length > 10)
            return Error.Validation("too many flags");

        if (model.Flags.Any(x => x == Guid.Empty))
            return Error.Validation("flags contain empty id");

        if (model.Text?.Length > 1000)
            return Error.Validation("text is too long");

        var companyExists = await reviewsQueryRepository.CompanyExistsAsync(model.CompanyId, ct);
        if (!companyExists)
            return Error.NotFound("company not found");

        var allFlagsExist = await reviewsQueryRepository.AllFlagsExistAsync(model.Flags, ct);
        if (!allFlagsExist)
            return Error.Validation("one or more flags not found");

        await reviewsCommandRepository.CreateReviewAsync(
            new CreateReviewCommandRepositoryModel
            {
                ReviewId = Guid.NewGuid(),
                CompanyId = model.CompanyId,
                AuthorId = model.UserId,
                Text = model.Text,
                FlagIds = model.Flags.Distinct().ToArray(),
                CreatedAtUtc = DateTime.UtcNow
            },
            ct);

        return Result.Success();
    }
}