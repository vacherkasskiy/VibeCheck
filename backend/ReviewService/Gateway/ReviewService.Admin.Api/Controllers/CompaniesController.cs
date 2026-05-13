using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReviewService.Admin.Api.DTOs.Companies;
using ReviewService.Core.Abstractions.Models.Admin.Companies;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Abstractions.Operations.Admin.Companies;
using Swashbuckle.AspNetCore.Annotations;

namespace ReviewService.Admin.Api.Controllers;

[ApiController]
[Route("api/companies")]
[Produces("application/json")]
[SwaggerTag("admin: CRUD компаний")]
[Authorize(Roles = "ADMIN,MANAGER")]
public sealed class CompaniesController(IMapper mapper) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(GetCompaniesResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<GetCompaniesResponse>> GetCompanies(
        [FromServices] IGetAdminCompaniesOperation operation,
        [FromQuery] string? q = null,
        [FromQuery] int take = 20,
        [FromQuery] int pageNum = 1,
        CancellationToken ct = default)
    {
        var result = await operation.GetAsync(
            new GetAdminCompaniesOperationModel(q, take, pageNum),
            ct);

        if (result.IsFailure)
            return ToError<GetCompaniesResponse>(result.Error, "get companies failed");

        return Ok(mapper.Map<GetCompaniesResponse>(result.Value));
    }

    [HttpGet("{companyId:guid}")]
    [ProducesResponseType(typeof(AdminCompanyDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AdminCompanyDto>> GetCompany(
        [FromServices] IGetAdminCompanyOperation operation,
        Guid companyId,
        CancellationToken ct = default)
    {
        var result = await operation.GetAsync(companyId, ct);

        if (result.IsFailure)
            return ToError<AdminCompanyDto>(result.Error, "get company failed");

        return Ok(mapper.Map<AdminCompanyDto>(result.Value));
    }

    [HttpPost]
    [Consumes("application/json")]
    [ProducesResponseType(typeof(AdminCompanyDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<AdminCompanyDto>> CreateCompany(
        [FromServices] ICreateAdminCompanyOperation operation,
        [FromBody] CreateCompanyRequest request,
        CancellationToken ct)
    {
        var result = await operation.CreateAsync(
            mapper.Map<CreateAdminCompanyOperationModel>(request),
            ct);

        if (result.IsFailure)
            return ToError<AdminCompanyDto>(result.Error, "create company failed");

        var response = mapper.Map<AdminCompanyDto>(result.Value);

        return CreatedAtAction(nameof(GetCompany), new { companyId = response.CompanyId }, response);
    }

    [HttpPut("{companyId:guid}")]
    [Consumes("application/json")]
    [ProducesResponseType(typeof(AdminCompanyDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<AdminCompanyDto>> UpdateCompany(
        [FromServices] IUpdateAdminCompanyOperation operation,
        Guid companyId,
        [FromBody] UpdateCompanyRequest request,
        CancellationToken ct)
    {
        var model = mapper.Map<UpdateAdminCompanyOperationModel>(request) with
        {
            CompanyId = companyId
        };

        var result = await operation.UpdateAsync(model, ct);

        if (result.IsFailure)
            return ToError<AdminCompanyDto>(result.Error, "update company failed");

        return Ok(mapper.Map<AdminCompanyDto>(result.Value));
    }

    [HttpDelete("{companyId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteCompany(
        [FromServices] IDeleteAdminCompanyOperation operation,
        Guid companyId,
        CancellationToken ct)
    {
        var result = await operation.DeleteAsync(companyId, ct);

        if (result.IsFailure)
            return ToError(result.Error, "delete company failed");

        return NoContent();
    }

    private ActionResult<T> ToError<T>(Error error, string title)
    {
        var problem = new ProblemDetails
        {
            Title = title,
            Detail = error.Message
        };

        return error.Type switch
        {
            ErrorType.NotFound => NotFound(problem),
            ErrorType.Conflict => Conflict(problem),
            _ => BadRequest(problem)
        };
    }

    private IActionResult ToError(Error error, string title)
    {
        var problem = new ProblemDetails
        {
            Title = title,
            Detail = error.Message
        };

        return error.Type switch
        {
            ErrorType.NotFound => NotFound(problem),
            ErrorType.Conflict => Conflict(problem),
            _ => BadRequest(problem)
        };
    }
}
