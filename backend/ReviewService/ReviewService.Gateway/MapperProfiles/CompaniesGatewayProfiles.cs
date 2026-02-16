using AutoMapper;
using ReviewService.Core.Abstractions.Models.Companies;
using ReviewService.Core.Abstractions.Models.Companies.CreateCompany;
using ReviewService.Core.Abstractions.Models.Companies.GetCompanies;
using ReviewService.Core.Abstractions.Models.Companies.GetCompany;
using ReviewService.Core.Abstractions.Models.Companies.GetCompanyFlags;
using ReviewService.Gateway.DTOs;
using ReviewService.Gateway.DTOs.Companies;
using ReviewService.Gateway.DTOs.Companies.CreateCompany;
using ReviewService.Gateway.DTOs.Companies.GetCompanies;
using ReviewService.Gateway.DTOs.Companies.GetCompany;
using ReviewService.Gateway.DTOs.Companies.GetCompanyFlags;

namespace ReviewService.Gateway.MapperProfiles;

public sealed class CompaniesGatewayProfiles : Profile
{
    public CompaniesGatewayProfiles()
    {
        // POST /companies
        CreateMap<CreateCompanyRequest, CreateCompanyOperationRequestModel>();
        CreateMap<CreateCompanyOperationResultModel, CreateCompanyResponse>();

        // GET /companies
        CreateMap<GetCompaniesOperationResultModel, GetCompaniesResponse>();
        CreateMap<CompanyListItemOperationModel, CompanyListItemDto>();
        CreateMap<CompanyFlagOperationModel, CompanyFlagDto>();

        // GET /companies/{companyId}
        CreateMap<GetCompanyOperationResultModel, GetCompanyResponse>();
        CreateMap<CompanyLinksOperationModel, CompanyLinksDto>();

        // GET /companies/{companyId}/flags
        CreateMap<GetCompanyFlagsOperationResultModel, GetCompanyFlagsResponse>();
        CreateMap<CompanyFlagOperationModel, CompanyFlagDto>();
    }
}