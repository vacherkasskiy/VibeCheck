using ReviewService.Core.Abstractions.Models.Reviews.CreateCompanyReview;
using ReviewService.Core.Abstractions.Observability;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Abstractions.Operations.Reviews;
using ReviewService.MessageBroker.Abstractions.Producers;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews;
using ReviewService.PersistentStorage.Abstractions.Repositories.Reviews;
using System.Diagnostics;

namespace ReviewService.Core.Operations.Reviews;

internal sealed class CreateCompanyReviewOperation(
    IReviewsQueryRepository reviewsQueryRepository,
    IReviewsCommandRepository reviewsCommandRepository,
    IReviewEventsProducer producer)
    : ICreateCompanyReviewOperation
{
    public async Task<Result> CreateAsync(
        CreateCompanyReviewOperationModel model,
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

            if (model.CompanyId == Guid.Empty)
            {
                status = "validation";
                return Error.Validation("companyId is required");
            }

            if (model.Flags is null || model.Flags.Length == 0)
            {
                status = "validation";
                return Error.Validation("flags are required");
            }

            if (model.Flags.Length > 10)
            {
                status = "validation";
                return Error.Validation("too many flags");
            }

            if (model.Flags.Any(x => x == Guid.Empty))
            {
                status = "validation";
                return Error.Validation("flags contain empty id");
            }

            if (model.Text?.Length > 1000)
            {
                status = "validation";
                return Error.Validation("text is too long");
            }

            var companyExists = await reviewsQueryRepository.CompanyExistsAsync(model.CompanyId, ct);
            if (!companyExists)
            {
                status = "not_found";
                return Error.NotFound("company not found");
            }

            var allFlagsExist = await reviewsQueryRepository.AllFlagsExistAsync(model.Flags, ct);
            if (!allFlagsExist)
            {
                status = "validation";
                return Error.Validation("one or more flags not found");
            }

            var newReview = new CreateReviewCommandRepositoryModel
            {
                ReviewId = Guid.NewGuid(),
                CompanyId = model.CompanyId,
                AuthorId = model.UserId,
                Text = model.Text,
                FlagIds = model.Flags.Distinct().ToArray(),
                CreatedAtUtc = DateTime.UtcNow
            };

            await reviewsCommandRepository.CreateReviewAsync(newReview, ct);

            await producer.PublishReviewWrittenAsync(
                newReview.ReviewId,
                newReview.AuthorId,
                newReview.CreatedAtUtc,
                ct);

            ReviewMetrics.RecordReviewCreated("success");

            return Result.Success();
        }
        catch
        {
            status = "exception";
            ReviewMetrics.RecordOperationError("create_company_review", "core", "exception");
            throw;
        }
        finally
        {
            ReviewMetrics.RecordOperationDuration("create_company_review", "core", status, stopwatch.Elapsed.TotalMilliseconds);
        }
    }
}
