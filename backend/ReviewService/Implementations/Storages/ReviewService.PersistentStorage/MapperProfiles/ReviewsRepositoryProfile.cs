using AutoMapper;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews.GetCompanyReviews;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews.GetMyReviews;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews.GetUserReviews;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews.Shared;
using ReviewService.PersistentStorage.Entites;

namespace ReviewService.PersistentStorage.MapperProfiles;

public sealed class ReviewsRepositoryProfile : Profile
{
    public ReviewsRepositoryProfile()
    {
        CreateMap<ReviewFlagEntity, FlagRepositoryModel>()
            .ForMember(
                dest => dest.Id,
                opt => opt.MapFrom(src => src.FlagId))
            .ForMember(
                dest => dest.Name,
                opt => opt.MapFrom(src => src.Flag.Name));

        CreateMap<ReviewEntity, CompanyReviewRepositoryItemOutputModel>()
            .ForMember(
                dest => dest.ReviewId,
                opt => opt.MapFrom(src => src.Id))
            .ForMember(
                dest => dest.AuthorIconId,
                opt => opt.MapFrom(src => src.Author.IconId))
            .ForMember(
                dest => dest.CreatedAt,
                opt => opt.MapFrom(src => DateTime.SpecifyKind(src.CreatedAt, DateTimeKind.Utc)))
            .ForMember(
                dest => dest.Flags,
                opt => opt.Ignore());

        CreateMap<ReviewEntity, UserReviewRepositoryItemOutputModel>()
            .ForMember(
                dest => dest.ReviewId,
                opt => opt.MapFrom(src => src.Id))
            .ForMember(
                dest => dest.CreatedAt,
                opt => opt.MapFrom(src => DateTime.SpecifyKind(src.CreatedAt, DateTimeKind.Utc)))
            .ForMember(
                dest => dest.AuthorId,
                opt => opt.MapFrom(src => src.AuthorId))
            .ForMember(
                dest => dest.Flags,
                opt => opt.Ignore());

        CreateMap<ReviewEntity, GetMyReviewsRepositoryOutputModel>();
        CreateMap<ReviewEntity, GetUserReviewsRepositoryOutputModel>();
        CreateMap<ReviewEntity, GetCompanyReviewsRepositoryOutputModel>();
    }
}