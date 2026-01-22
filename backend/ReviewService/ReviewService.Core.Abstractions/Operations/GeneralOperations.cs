using ReviewService.Core.Abstractions.Models;
using ReviewService.Core.Abstractions.Models.Shared;

namespace ReviewService.Core.Abstractions.Operations;

public interface ICreateCompanyReviewOperation
{
    Task<Result> CreateAsync(CreateCompanyReviewOperationModel model, CancellationToken ct);
}

public interface IUpdateCompanyReviewOperation
{
    Task<Result> UpdateAsync(UpdateCompanyReviewOperationModel model, CancellationToken ct);
}

public interface IDeleteCompanyReviewOperation
{
    Task<Result> DeleteAsync(DeleteCompanyReviewOperationModel model, CancellationToken ct);
}

public interface IGetCompanyReviewsOperation
{
    Task<Result<CompanyReviewsPageModel>> GetAsync(GetCompanyReviewsOperationModel model, CancellationToken ct);
}

public interface IGetMyReviewsOperation
{
    Task<Result<UserReviewsPageModel>> GetAsync(GetMyReviewsOperationModel model, CancellationToken ct);
}

public interface IGetUserReviewsOperation
{
    Task<Result<UserReviewsPageModel>> GetAsync(GetUserReviewsOperationModel model, CancellationToken ct);
}

public interface IVoteReviewOperation
{
    Task<Result> VoteAsync(VoteReviewOperationModel model, CancellationToken ct);
}

public interface IReportReviewOperation
{
    Task<Result> ReportAsync(ReportReviewOperationModel model, CancellationToken ct);
}