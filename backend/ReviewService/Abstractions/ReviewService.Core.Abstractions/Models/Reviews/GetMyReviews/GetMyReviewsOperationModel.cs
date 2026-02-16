using ReviewService.Core.Abstractions.Enums;

namespace ReviewService.Core.Abstractions.Models.Reviews.GetMyReviews;

public sealed record GetMyReviewsOperationModel(
    Guid CurrentUserId,
    int Take,
    int PageNum,
    ReviewsSortOperationEnum SortOperationEnum);