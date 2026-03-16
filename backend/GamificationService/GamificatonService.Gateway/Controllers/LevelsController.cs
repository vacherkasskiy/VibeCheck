using AutoMapper;
using GamificatonService.Core.Abstractions.Helpers;
using GamificatonService.Core.Abstractions.Operations.Levels;
using GamificatonService.Gateway.DTOs.GetLevel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace GamificatonService.Gateway.Controllers;

/// <summary>
/// уровни пользователей.
/// </summary>
[ApiController]
[Route("api/users")]
[Produces("application/json")]
[SwaggerTag("пользователи: уровень")]
[Authorize]
public sealed class LevelsController(IMapper mapper) : ControllerBase
{
    /// <summary>
    /// GET /users/me/level — получить уровень текущего юзера
    /// </summary>
    [HttpGet("me/level")]
    [ProducesResponseType(typeof(GetLevelGatewayResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [SwaggerOperation(
        Summary = "уровень текущего пользователя",
        Description = "возвращает currentLevel и прогресс до следующего уровня."
    )]
    public async Task<ActionResult<GetLevelGatewayResponse>> GetMyLevel(
        [FromServices] IGetUserLevelOperation operation,
        [FromServices] ICurrentUserAccessor currentUserAccessor,
        CancellationToken ct = default)
    {
        var userId = currentUserAccessor.GetRequiredUserId(User);

        var result = await operation.GetAsync(userId, ct);

        if (result.IsFailure)
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "get my level failed",
                Detail = result.Error.Message
            });

        return Ok(mapper.Map<GetLevelGatewayResponse>(result.Value));
    }

    /// <summary>
    /// GET /users/{userId}/level — получить уровень другого юзера
    /// </summary>
    [HttpGet("{userId:guid}/level")]
    [ProducesResponseType(typeof(GetLevelGatewayResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [SwaggerOperation(
        Summary = "уровень пользователя",
        Description = "возвращает currentLevel и прогресс пользователя."
    )]
    public async Task<ActionResult<GetLevelGatewayResponse>> GetUserLevel(
        [FromServices] IGetUserLevelOperation operation,
        Guid userId,
        CancellationToken ct = default)
    {
        var result = await operation.GetAsync(userId, ct);

        if (result.IsFailure)
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "get user level failed",
                Detail = result.Error.Message
            });

        return Ok(mapper.Map<GetLevelGatewayResponse>(result.Value));
    }
}