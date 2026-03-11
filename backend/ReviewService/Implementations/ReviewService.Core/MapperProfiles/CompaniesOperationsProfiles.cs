using AutoMapper;
using ReviewService.Core.Abstractions.Models.Companies;
using ReviewService.Core.Abstractions.Models.Companies.CreateCompany;
using ReviewService.Core.Abstractions.Models.Companies.GetCompanies;
using ReviewService.Core.Abstractions.Models.Companies.GetCompany;
using ReviewService.Core.Abstractions.Models.Companies.GetCompanyFlags;
using ReviewService.PersistentStorage.Abstractions.Models.Companies.CreateCompany;
using ReviewService.PersistentStorage.Abstractions.Models.Companies.GetCompanies;
using ReviewService.PersistentStorage.Abstractions.Models.Companies.GetCompany;
using ReviewService.PersistentStorage.Abstractions.Models.Companies.GetCompanyFlags;
using ReviewService.PersistentStorage.Abstractions.Models.Shared;

namespace ReviewService.Core.MapperProfiles;

internal sealed class CompaniesOperationsProfiles : Profile
{
    public CompaniesOperationsProfiles()
    {
        // -------------------------
        // GetCompanies
        // -------------------------

        // operation input -> repository input
        CreateMap<GetCompaniesOperationModel, GetCompaniesRepositoryInputModel>();

        // repository output -> operation result
        CreateMap<GetCompaniesRepositoryOutputModel, GetCompaniesOperationResultModel>();
        CreateMap<CompanyListItemRepositoryModel, CompanyListItemOperationModel>()
            .ForMember(x => x.Weight, opt => opt.Ignore());
        CreateMap<FlagCountRepositoryModel, CompanyFlagOperationModel>();

        // -------------------------
        // GetCompany
        // -------------------------

        // Guid -> repository input
        CreateMap<Guid, GetCompanyRepositoryInputModel>()
            .ForMember(d => d.CompanyId, o => o.MapFrom(s => s));

        // repository output -> operation result
        CreateMap<GetCompanyRepositoryOutputModel, GetCompanyOperationResultModel>();
        CreateMap<CompanyLinksRepositoryModel, CompanyLinksOperationModel>();
        CreateMap<FlagCountRepositoryModel, CompanyFlagOperationModel>();

        // operation input -> repository input
        CreateMap<GetCompanyFlagsOperationModel, GetCompanyFlagsRepositoryInputModel>();

        // repository output -> operation result
        CreateMap<GetCompanyFlagsRepositoryOutputModel, GetCompanyFlagsOperationResultModel>();
        CreateMap<CompanyFlagRepositoryModel, CompanyFlagOperationModel>();

        // -------------------------
        // CreateCompany
        // -------------------------

        CreateMap<CreateCompanyOperationRequestModel, CreateCompanyRequestRepositoryInputModel>()
            .ForMember(
                dest => dest.RequesterUserId,
                opt => opt.MapFrom(src => src.UserId))
            .ForMember(
                dest => dest.SiteUrl,
                opt => opt.MapFrom(src => src.Site));

        CreateMap<CreateCompanyRequestRepositoryOutputModel, CreateCompanyOperationResultModel>()
            .ForMember(
                dest => dest.RequestId,
                opt => opt.MapFrom(src => src.RequestId.ToString()))
            .ForMember(
                dest => dest.CreatedAt,
                opt => opt.MapFrom(src =>
                    new DateTimeOffset(DateTime.SpecifyKind(src.CreatedAtUtc, DateTimeKind.Utc))));
    }
}