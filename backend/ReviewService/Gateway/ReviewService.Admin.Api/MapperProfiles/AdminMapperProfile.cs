using AutoMapper;
using ReviewService.Admin.Api.DTOs.Companies;
using ReviewService.Admin.Api.DTOs.Flags;
using ReviewService.Admin.Api.DTOs.Reviews;
using ReviewService.Core.Abstractions.Models.Admin.Companies;
using ReviewService.Core.Abstractions.Models.Admin.Flags;
using ReviewService.Core.Abstractions.Models.Admin.Reviews;
using ReviewService.Core.Abstractions.Models.Flags;

namespace ReviewService.Admin.Api.MapperProfiles;

public sealed class AdminMapperProfile : Profile
{
    public AdminMapperProfile()
    {
        CreateMap<AdminCompaniesPageOperationModel, GetCompaniesResponse>();
        CreateMap<AdminCompanyOperationModel, AdminCompanyDto>();
        CreateMap<CreateCompanyRequest, CreateAdminCompanyOperationModel>();
        CreateMap<UpdateCompanyRequest, UpdateAdminCompanyOperationModel>()
            .ForMember(x => x.CompanyId, opt => opt.Ignore());

        CreateMap<CompanyRequestsPageOperationModel, GetCompanyRequestsResponse>();
        CreateMap<CompanyRequestOperationModel, CompanyRequestDto>();

        CreateMap<AdminFlagsPageOperationModel, GetFlagsResponse>();
        CreateMap<AdminFlagOperationModel, AdminFlagDto>();
        CreateMap<CreateFlagRequest, CreateAdminFlagOperationModel>();
        CreateMap<UpdateFlagRequest, UpdateAdminFlagOperationModel>()
            .ForMember(x => x.FlagId, opt => opt.Ignore());
        CreateMap<FlagCategoryDtoEnum, FlagCategoryOperationEnum>();
        CreateMap<FlagCategoryOperationEnum, FlagCategoryDtoEnum>();

        CreateMap<AdminReviewReportsPageOperationModel, GetReviewReportsResponse>();
        CreateMap<AdminReviewReportOperationModel, ReviewReportDto>();
    }
}
