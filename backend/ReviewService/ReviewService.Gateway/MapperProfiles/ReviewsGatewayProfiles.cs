using AutoMapper;
using ReviewService.Core.Abstractions.Enums;
using ReviewService.Core.Abstractions.Models.Reviews;
using ReviewService.Core.Abstractions.Models.Reviews.CreateCompanyReview;
using ReviewService.Core.Abstractions.Models.Reviews.DeleteCompanyReview;
using ReviewService.Core.Abstractions.Models.Reviews.GetCompanyReviews;
using ReviewService.Core.Abstractions.Models.Reviews.GetUserReviews;
using ReviewService.Core.Abstractions.Models.Reviews.ReportReview;
using ReviewService.Core.Abstractions.Models.Reviews.UpdateCompanyReview;
using ReviewService.Gateway.DTOs;
using ReviewService.Gateway.DTOs.Reviews.CreateCompanyReview;
using ReviewService.Gateway.DTOs.Reviews.DeleteCompanyReview;
using ReviewService.Gateway.DTOs.Reviews.GetCompanyReviews;
using ReviewService.Gateway.DTOs.Reviews.GetUserReviews;

namespace ReviewService.Gateway.MapperProfiles;

public sealed class ReviewsGatewayProfiles : Profile
{
    public ReviewsGatewayProfiles()
    {
        // create/update/delete
        CreateMap<CreateCompanyReviewRequest, CreateCompanyReviewOperationModel>();
        CreateMap<UpdateCompanyReviewRequest, UpdateCompanyReviewOperationModel>();
        CreateMap<DeleteCompanyReviewRequest, DeleteCompanyReviewOperationModel>();

        // report/vote
        CreateMap<ReportReviewRequest, ReportReviewOperationModel>();
        CreateMap<VoteReviewRequest, VoteReviewOperationModel>();

        // company reviews list
        CreateMap<CompanyReviewsPageOperationModel, GetCompanyReviewsResponse>();
        CreateMap<CompanyReviewOperationModel, CompanyReviewItemDto>();
        CreateMap<FlagOperationModel, FlagDto>();

        // user reviews list (me + user)
        CreateMap<UserReviewsPageOperationModel, GetUserReviewsResponse>();
        CreateMap<UserReviewReadOperationModel, UserReviewItemDto>();

        // sort enum: gateway -> operation
        CreateMap<ReviewsSortGatewayEnum, ReviewsSortOperationEnum>();
    }
}