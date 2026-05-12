using AutoMapper;
using ReviewService.Core.Abstractions.Models.Companies;
using ReviewService.Core.Abstractions.Models.Companies.CreateCompany;
using ReviewService.Core.Abstractions.Models.Companies.GetCompanies;
using ReviewService.Core.Abstractions.Models.Companies.GetCompany;
using ReviewService.Core.Abstractions.Models.Companies.GetCompanyFlags;
using ReviewService.Gateway.Api.DTOs.Companies;
using ReviewService.Gateway.Api.DTOs.Companies.CreateCompany;
using ReviewService.Gateway.Api.DTOs.Companies.GetCompanies;
using ReviewService.Gateway.Api.DTOs.Companies.GetCompany;
using ReviewService.Gateway.Api.DTOs.Companies.GetCompanyFlags;
using ReviewService.Gateway.Api.DTOs;

namespace ReviewService.Gateway.Api.MapperProfiles;

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