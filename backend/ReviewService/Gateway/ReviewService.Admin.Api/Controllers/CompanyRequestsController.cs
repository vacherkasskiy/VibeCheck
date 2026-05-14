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
[Route("api/admin/company-requests")]
[Produces("application/json")]
[SwaggerTag("admin: заявки на добавление компаний")]
[Authorize(Roles = "ADMIN,MANAGER")]
public sealed class CompanyRequestsController(IMapper mapper) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(GetCompanyRequestsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<GetCompanyRequestsResponse>> GetCompanyRequests(
        [FromServices] IGetCompanyRequestsOperation operation,
        [FromQuery] string? status = null,
        [FromQuery] string? q = null,
        [FromQuery] int take = 20,
        [FromQuery] int pageNum = 1,
        CancellationToken ct = default)
    {
        var result = await operation.GetAsync(
            new GetCompanyRequestsOperationModel(status, q, take, pageNum),
            ct);

        if (result.IsFailure)
            return ToError<GetCompanyRequestsResponse>(result.Error, "get company requests failed");

        return Ok(mapper.Map<GetCompanyRequestsResponse>(result.Value));
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
}
