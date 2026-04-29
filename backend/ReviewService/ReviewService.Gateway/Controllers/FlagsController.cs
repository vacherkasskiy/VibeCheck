using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReviewService.Core.Abstractions.Helpers;
using ReviewService.Core.Abstractions.Models.Flags;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Abstractions.Operations.Flags;
using ReviewService.Gateway.DTOs.Flags;
using Swashbuckle.AspNetCore.Annotations;

namespace ReviewService.Gateway.Controllers;

[ApiController]
[Route("api/flags")]
[Produces("application/json")]
[SwaggerTag("флаги: справочник")]
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
    /// получить гринфлаги и редфлаги текущего пользователя.
    /// </summary>
    [HttpGet("/api/users/me/flags")]
    [ProducesResponseType(typeof(GetMyUserFlagsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [SwaggerOperation(Summary = "получить флаги текущего пользователя")]
    [Authorize]
    public async Task<ActionResult<GetMyUserFlagsResponse>> GetMyUserFlags(
        [FromServices] IGetMyUserFlagsOperation operation,
        [FromServices] ICurrentUserAccessor currentUserAccessor,
        CancellationToken ct)
    {
        var currentUserId = currentUserAccessor.GetRequiredUserId(User);
        var result = await operation.GetAsync(currentUserId, ct);

        if (result.IsFailure)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "get my user flags failed",
                Detail = result.Error.Message
            });
        }

        return Ok(mapper.Map<GetMyUserFlagsResponse>(result.Value));
    }

    /// <summary>
    /// получить гринфлаги и редфлаги другого пользователя.
    /// </summary>
    [HttpGet("/api/users/{userId:guid}/flags")]
    [ProducesResponseType(typeof(GetUserFlagsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [SwaggerOperation(Summary = "получить флаги пользователя")]
    [Authorize]
    public async Task<ActionResult<GetUserFlagsResponse>> GetUserFlags(
        [FromServices] IGetUserFlagsOperation operation,
        Guid userId,
        CancellationToken ct)
    {
        var result = await operation.GetAsync(userId, ct);

        if (result.IsFailure)
        {
            if (result.Error.Type == ErrorType.NotFound)
            {
                return NotFound(new ProblemDetails
                {
                    Title = "user not found",
                    Detail = result.Error.Message
                });
            }

            return BadRequest(new ProblemDetails
            {
                Title = "get user flags failed",
                Detail = result.Error.Message
            });
        }

        return Ok(mapper.Map<GetUserFlagsResponse>(result.Value));
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
    [Authorize]
    public async Task<IActionResult> SetUserFlags(
        [FromBody] SetUserFlagsRequest request,
        [FromServices] ISetUserFlagsOperation operation,
        [FromServices] ICurrentUserAccessor currentUserAccessor,
        CancellationToken ct)
    {
        var userId = currentUserAccessor.GetRequiredUserId(User);

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
}
