using AutoMapper;
using ReviewService.Core.Abstractions.Models.Companies;
using ReviewService.Core.Abstractions.Models.Companies.GetCompanies;
using ReviewService.Core.Abstractions.Models.Companies.GetCompany;
using ReviewService.Core.Abstractions.Models.Companies.GetCompanyFlags;
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
        CreateMap<CompanyListItemRepositoryModel, CompanyListItemOperationModel>();
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
    }
}