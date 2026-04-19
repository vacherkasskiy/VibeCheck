using System.Security.Claims;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReviewService.Core.Abstractions.Models.Flags;
using ReviewService.Core.Abstractions.Operations.Flags;
using ReviewService.Gateway.DTOs.Flags;
using Swashbuckle.AspNetCore.Annotations;

namespace ReviewService.Gateway.Controllers;

[ApiController]
[Route("api/flags")]
[Produces("application/json")]
[SwaggerTag("флаги: справочник")]
[Authorize]
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

    /// <summary>
    /// полностью заменить выбранные пользователем гринфлаги и редфлаги.
    /// </summary>
    [HttpPut("/api/users/flags")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [SwaggerOperation(Summary = "заполнить гринфлаги/редфлаги пользователя")]
    public async Task<IActionResult> SetUserFlags(
        [FromBody] SetUserFlagsRequest request,
        [FromServices] ISetUserFlagsOperation operation,
        CancellationToken ct)
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized(new ProblemDetails
            {
                Title = "unauthorized",
                Detail = "user id claim was not found"
            });
        }

        var model = new SetUserFlagsOperationModel
        {
            GreenFlags = request.GreenFlags
                .Select(x => new SetUserFlagGroupOperationModel
                {
                    Weight = x.Weight,
                    Flags = x.Flags.ToArray()
                })
                .ToArray(),
            RedFlags = request.RedFlags
                .Select(x => new SetUserFlagGroupOperationModel
                {
                    Weight = x.Weight,
                    Flags = x.Flags.ToArray()
                })
                .ToArray()
        };

        var result = await operation.ExecuteAsync(userId, model, ct);

        if (result.IsFailure)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "set user flags failed",
                Detail = result.Error.Message
            });
        }

        return NoContent();
    }

    private bool TryGetCurrentUserId(out Guid userId)
    {
        var rawUserId =
            User.FindFirstValue(ClaimTypes.NameIdentifier) ??
            User.FindFirstValue("sub");

        return Guid.TryParse(rawUserId, out userId);
    }
}