using AutoMapper;
using GamificatonService.Core.Abstractions.Enums;
using GamificatonService.Core.Abstractions.Models.GetMyAchievements;
using GamificatonService.Core.Abstractions.Models.GetUserAchievements;
using GamificatonService.Core.Abstractions.Operations.Achievements;
using GamificatonService.Gateway.DTOs.GetMyAchievements;
using GamificatonService.Gateway.DTOs.GetUserAchievements;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace GamificatonService.Gateway.Controllers;

/// <summary>
/// достижения пользователей.
/// </summary>
[ApiController]
[Route("api/users")]
[Produces("application/json")]
[SwaggerTag("пользователи: достижения")]
//[Authorize]
public sealed class AchievementsController(IMapper mapper) : ControllerBase
{
    /// <summary>
    /// GET …/users/me/achievements — список достижений текущего пользователя (все статусы)
    /// </summary>
    [HttpGet("me/achievements")]
    [ProducesResponseType(typeof(GetMyAchievementsGatewayResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [SwaggerOperation(
        Summary = "достижения текущего пользователя",
        Description = "возвращает весь каталог достижений пользователя с их статусами/прогрессом."
    )]
    public async Task<ActionResult<GetMyAchievementsGatewayResponse>> GetMyAchievements(
        [FromServices] IGetMyAchievementsOperation operation,
        [FromQuery] int take = 20,
        [FromQuery] int pageNum = 1,
        [FromQuery] MyAchievementsFilterStatusGatewayEnum status = MyAchievementsFilterStatusGatewayEnum.All,
        CancellationToken ct = default)
    {
        var model = new GetMyAchievementsOperationModel(
            Take: take,
            PageNum: pageNum,
            Status: mapper.Map<MyAchievementsFilterStatusOperationEnum>(status));

        var result = await operation.GetAsync(model, ct);

        if (result.IsFailure)
            return BadRequest(new ProblemDetails
            {
                Title = "get my achievements failed",
                Detail = result.Error.Message
            });

        return Ok(mapper.Map<GetMyAchievementsGatewayResponse>(result.Value));
    }

    /// <summary>
    /// GET …/users/{userId}/achievements — список полученных достижений другого пользователя
    /// </summary>
    [HttpGet("{userId:guid}/achievements")]
    [ProducesResponseType(typeof(GetUserAchievementsGatewayResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [SwaggerOperation(
        Summary = "полученные достижения пользователя",
        Description = "всегда возвращает только полученные достижения другого пользователя."
    )]
    public async Task<ActionResult<GetUserAchievementsGatewayResponse>> GetUserAchievements(
        [FromServices] IGetUserAchievementsOperation operation,
        Guid userId,
        [FromQuery] long take = 20,
        [FromQuery] long pageNum = 1,
        CancellationToken ct = default)
    {
        var model = new GetUserAchievementsOperationModel(
            UserId: userId,
            Take: take,
            PageNum: pageNum);

        var result = await operation.GetAsync(model, ct);

        if (result.IsFailure)
        {
            // если есть коды ошибок — лучше маппить по ним
            if (string.Equals(result.Error.Message, "not_found", StringComparison.OrdinalIgnoreCase))
                return NotFound(new ProblemDetails
                {
                    Title = "user not found",
                    Detail = result.Error.Message
                });

            if (string.Equals(result.Error.Message, "forbidden", StringComparison.OrdinalIgnoreCase))
                return StatusCode(StatusCodes.Status403Forbidden, new ProblemDetails
                {
                    Title = "forbidden",
                    Detail = result.Error.Message
                });

            return BadRequest(new ProblemDetails
            {
                Title = "get user achievements failed",
                Detail = result.Error.Message
            });
        }

        return Ok(mapper.Map<GetUserAchievementsGatewayResponse>(result.Value));
    }
}