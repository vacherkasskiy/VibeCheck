using AutoMapper;
using ReviewService.PersistentStorage.Abstractions.Models.Companies.GetCompanies;
using ReviewService.PersistentStorage.Abstractions.Models.Companies.GetCompany;
using ReviewService.PersistentStorage.Abstractions.Models.Companies.GetCompanyFlags;
using ReviewService.PersistentStorage.Abstractions.Models.Shared;
using ReviewService.PersistentStorage.Entites;

namespace ReviewService.PersistentStorage.MapperProfiles;

public sealed class CompaniesRepositoryProfile : Profile
{
    public CompaniesRepositoryProfile()
    {
        CreateMap<CompanyEntity, CompanyListItemRepositoryModel>()
            .ForMember(
                dest => dest.CompanyId,
                opt => opt.MapFrom(src => src.Id))
            .ForMember(
                dest => dest.TopFlags,
                opt => opt.Ignore());

        CreateMap<CompanyEntity, GetCompanyRepositoryOutputModel>()
            .ForMember(
                dest => dest.CompanyId,
                opt => opt.MapFrom(src => src.Id))
            .ForMember(
                dest => dest.Links,
                opt => opt.MapFrom(src => new CompanyLinksRepositoryModel
                {
                    Site = src.SiteUrl,
                    Linkedin = src.LinkedinUrl,
                    Hh = src.HrUrl
                }))
            .ForMember(
                dest => dest.TopFlags,
                opt => opt.Ignore());

        CreateMap<CompanyFlagEntity, FlagCountRepositoryModel>()
            .ForMember(
                dest => dest.Id,
                opt => opt.MapFrom(src => src.FlagId))
            .ForMember(
                dest => dest.Name,
                opt => opt.MapFrom(src => src.Flag.Name))
            .ForMember(
                dest => dest.Count,
                opt => opt.MapFrom(src => src.ReviewsCount));

        CreateMap<CompanyFlagEntity, CompanyFlagRepositoryModel>()
            .ForMember(
                dest => dest.Id,
                opt => opt.MapFrom(src => src.FlagId))
            .ForMember(
                dest => dest.Name,
                opt => opt.MapFrom(src => src.Flag.Name))
            .ForMember(
                dest => dest.Count,
                opt => opt.MapFrom(src => src.ReviewsCount));
    }
}