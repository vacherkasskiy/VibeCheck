using AutoMapper;
using GamificatonService.Core.Abstractions.Operations;
using GamificatonService.Core.Abstractions.Operations.Levels;
using GamificatonService.Gateway.DTOs;
using GamificatonService.Gateway.DTOs.GetLevel;
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
//[Authorize]
public sealed class LevelsController(IMapper mapper) : ControllerBase
{
    /// <summary>
    /// GET /users/me/level — получить уровень текущего юзера
    /// </summary>
    [HttpGet("me/level")]
    [ProducesResponseType(typeof(GetLevelResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [SwaggerOperation(
        Summary = "уровень текущего пользователя",
        Description = "возвращает currentLevel и прогресс до следующего уровня."
    )]
    public async Task<ActionResult<GetLevelResponse>> GetMyLevel(
        [FromServices] IGetMyLevelOperation operation,
        CancellationToken ct = default)
    {
        var result = await operation.GetAsync(ct);

        if (result.IsFailure)
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "get my level failed",
                Detail = result.Error.Message
            });

        return Ok(mapper.Map<GetLevelResponse>(result.Value));
    }

    /// <summary>
    /// GET /users/{userId}/level — получить уровень другого юзера
    /// </summary>
    [HttpGet("{userId:guid}/level")]
    [ProducesResponseType(typeof(GetLevelResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [SwaggerOperation(
        Summary = "уровень пользователя",
        Description = "возвращает currentLevel и прогресс пользователя."
    )]
    public async Task<ActionResult<GetLevelResponse>> GetUserLevel(
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

        return Ok(mapper.Map<GetLevelResponse>(result.Value));
    }
}