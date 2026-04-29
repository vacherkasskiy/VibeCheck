using ReviewService.Core.Abstractions.Enums;

namespace ReviewService.Core.Abstractions.Models.Reviews.GetCompanyReviews;

public sealed record GetCompanyReviewsOperationModel(
    Guid CurrentUserId,
    Guid CompanyId,
    int Take,
    int PageNum,
    ReviewsSortOperationEnum Sort);
