using ReviewService.Core.Abstractions.Enums;

namespace ReviewService.Core.Abstractions.Models.Reviews.GetUserReviews;

public sealed record GetUserReviewsOperationModel(
    Guid UserId,
    int Take,
    int PageNum,
    ReviewsSortOperationEnum SortOperationEnum);