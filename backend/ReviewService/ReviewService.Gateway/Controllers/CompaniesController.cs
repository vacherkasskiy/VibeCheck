using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReviewService.Core.Abstractions.Models.Companies.CreateCompany;
using ReviewService.Core.Abstractions.Models.Companies.GetCompanies;
using ReviewService.Core.Abstractions.Models.Companies.GetCompanyFlags;
using ReviewService.Core.Abstractions.Operations.Companies;
using ReviewService.Gateway.DTOs.Companies.CreateCompany;
using ReviewService.Gateway.DTOs.Companies.GetCompanies;
using ReviewService.Gateway.DTOs.Companies.GetCompany;
using ReviewService.Gateway.DTOs.Companies.GetCompanyFlags;
using Swashbuckle.AspNetCore.Annotations;

namespace ReviewService.Gateway.Controllers;

/// <summary>
/// компании.
/// </summary>
/// <remarks>
/// методы из твоей спецификации:
/// - список компаний
/// - страница компании
/// - флаги компании
/// - заявка на добавление компании
/// </remarks>
[ApiController]
[Route("api/companies")]
[Produces("application/json")]
[SwaggerTag("компании (список, страница, флаги, заявки)")]
[Authorize]
public sealed class CompaniesController(IMapper mapper) : ControllerBase
{
    /// <summary>
    /// GET …/companies — список компаний для текущего пользователя, отсортированный по весу
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(GetCompaniesResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [SwaggerOperation(
        Summary = "список компаний",
        Description = "возвращает компании для текущего пользователя, сортировка по weight."
    )]
    public async Task<ActionResult<GetCompaniesResponse>> GetCompanies(
        [FromServices] IGetCompaniesOperation operation,
        [FromQuery] string? query = null,
        [FromQuery] long take = 20,
        [FromQuery] long pageNum = 1,
        [FromQuery] string? q = null,
        CancellationToken ct = default)
    {
        var model = new GetCompaniesOperationModel(
            Query: query,
            Take: take,
            PageNum: pageNum,
            Q: q);

        var result = await operation.GetAsync(model, ct);

        if (result.IsFailure)
            return BadRequest(new ProblemDetails
            {
                Title = "get companies failed",
                Detail = result.Error.Message
            });

        return Ok(mapper.Map<GetCompaniesResponse>(result.Value));
    }

    /// <summary>
    /// GET …/companies/{companyId} — страница компании (короткая сводка + топ-20 флагов)
    /// </summary>
    [HttpGet("{companyId:guid}")]
    [ProducesResponseType(typeof(GetCompanyResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [SwaggerOperation(
        Summary = "страница компании",
        Description = "короткая сводка компании + topFlags (до 20)."
    )]
    public async Task<ActionResult<GetCompanyResponse>> GetCompany(
        [FromServices] IGetCompanyOperation operation,
        Guid companyId,
        CancellationToken ct = default)
    {
        var result = await operation.GetAsync(companyId, ct);

        if (result.IsFailure)
            return NotFound(new ProblemDetails
            {
                Title = "company not found",
                Detail = result.Error.Message
            });

        return Ok(mapper.Map<GetCompanyResponse>(result.Value));
    }

    /// <summary>
    /// GET …/companies/{companyId}/flags — полный список флагов компании с количествами (сортировка по count)
    /// </summary>
    [HttpGet("{companyId:guid}/flags")]
    [ProducesResponseType(typeof(GetCompanyFlagsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [SwaggerOperation(
        Summary = "флаги компании",
        Description = "полный список флагов компании с количествами, сортировка по count."
    )]
    public async Task<ActionResult<GetCompanyFlagsResponse>> GetCompanyFlags(
        [FromServices] IGetCompanyFlagsOperation operation,
        Guid companyId,
        [FromQuery] string? q = null,
        [FromQuery] long take = 50,
        [FromQuery] long pageNum = 1,
        CancellationToken ct = default)
    {
        var model = new GetCompanyFlagsOperationModel(
            CompanyId: companyId,
            Q: q,
            Take: take,
            PageNum: pageNum);

        var result = await operation.GetAsync(model, ct);

        if (result.IsFailure)
            return NotFound(new ProblemDetails
            {
                Title = "company flags not found",
                Detail = result.Error.Message
            });

        return Ok(mapper.Map<GetCompanyFlagsResponse>(result.Value));
    }

    /// <summary>
    /// POST …/companies — заявка на добавление новой компании
    /// </summary>
    [HttpPost]
    [Consumes("application/json")]
    [ProducesResponseType(typeof(CreateCompanyResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [SwaggerOperation(
        Summary = "заявка на добавление компании",
        Description = "создаёт заявку (status=pending). 403 — если политика запрещает подачу заявок."
    )]
    public async Task<ActionResult<CreateCompanyResponse>> CreateCompanyRequest(
        [FromServices] ICreateCompanyRequestOperation operation,
        [FromBody, SwaggerRequestBody("данные заявки", Required = true)]
        CreateCompanyRequest request,
        CancellationToken ct)
    {
        var model = mapper.Map<CreateCompanyOperationRequestModel>(request);
        var result = await operation.CreateAsync(model, ct);

        if (result.IsFailure)
        {
            if (string.Equals(result.Error.Message, "policy_forbidden", StringComparison.OrdinalIgnoreCase))
                return StatusCode(StatusCodes.Status403Forbidden, new ProblemDetails
                {
                    Title = "forbidden",
                    Detail = result.Error.Message
                });

            return BadRequest(new ProblemDetails
            {
                Title = "create company request failed",
                Detail = result.Error.Message
            });
        }
        
        return StatusCode(StatusCodes.Status201Created, mapper.Map<CreateCompanyResponse>(result.Value));
    }
}