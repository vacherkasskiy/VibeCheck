using AutoMapper;
using ReviewService.Core.Abstractions.Enums;
using ReviewService.Core.Abstractions.Models.Reviews;
using ReviewService.Core.Abstractions.Models.Reviews.GetCompanyReviews;
using ReviewService.Core.Abstractions.Models.Reviews.GetMyReviews;
using ReviewService.Core.Abstractions.Models.Reviews.GetUserReviews;
using ReviewService.PersistentStorage.Abstractions.Enums;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews.GetCompanyReviews;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews.GetMyReviews;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews.GetUserReviews;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews.Shared;

namespace ReviewService.Core.MapperProfiles;

internal sealed class ReviewsOperationsProfiles : Profile
{
    public ReviewsOperationsProfiles()
    {
        // -------------------------
        // input: operation -> repository
        // -------------------------

        CreateMap<GetCompanyReviewsOperationModel, GetCompanyReviewsRepositoryInputModel>();
        CreateMap<GetMyReviewsOperationModel, GetMyReviewsRepositoryInputModel>();
        CreateMap<GetUserReviewsOperationModel, GetUserReviewsRepositoryInputModel>();
        CreateMap<ReviewsSortOperationEnum, ReviewsSortRepositoryEnum>();
        // -------------------------
        // output: repository -> operation
        // -------------------------

        // company reviews page
        CreateMap<GetCompanyReviewsRepositoryOutputModel, CompanyReviewsPageOperationModel>();
        CreateMap<CompanyReviewRepositoryItemOutputModel, CompanyReviewOperationModel>();
        CreateMap<FlagRepositoryModel, FlagOperationModel>();

        // user reviews page (me + user)
        CreateMap<GetMyReviewsRepositoryOutputModel, UserReviewsPageOperationModel>();
        CreateMap<GetUserReviewsRepositoryOutputModel, UserReviewsPageOperationModel>();
        CreateMap<UserReviewRepositoryItemOutputModel, UserReviewReadOperationModel>();
    }
}