using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReviewService.Core.Abstractions.Operations.Flags;
using ReviewService.Gateway.DTOs.Flags;
using Swashbuckle.AspNetCore.Annotations;

namespace ReviewService.Gateway.Controllers;

[ApiController]
[Route("api/flags")]
[Produces("application/json")]
[SwaggerTag("флаги: справочник")]
//[Authorize]
public sealed class FlagsController(IMapper mapper) : ControllerBase
{
    /// <summary>
    /// получить все флаги (справочник).
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(GetAllFlagsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [SwaggerOperation(Summary = "все флаги")]
    public async Task<ActionResult<GetAllFlagsResponse>> GetAll(
        [FromServices] IGetAllFlagsOperation operation,
        CancellationToken ct)
    {
        var result = await operation.GetAsync(ct);

        if (result.IsFailure)
            return BadRequest(new ProblemDetails { Title = "get flags failed", Detail = result.Error.Message });

        return Ok(mapper.Map<GetAllFlagsResponse>(result.Value));
    }
}