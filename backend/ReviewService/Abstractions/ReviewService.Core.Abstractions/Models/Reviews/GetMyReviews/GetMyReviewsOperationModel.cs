using ReviewService.Core.Abstractions.Enums;

namespace ReviewService.Core.Abstractions.Models.Reviews.GetMyReviews;

public sealed record GetMyReviewsOperationModel(
    int Take,
    int PageNum,
    ReviewsSortOperationEnum SortOperationEnum);