using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReviewService.Admin.Api.DTOs.Flags;
using ReviewService.Core.Abstractions.Models.Admin.Flags;
using ReviewService.Core.Abstractions.Models.Flags;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Abstractions.Operations.Admin.Flags;
using Swashbuckle.AspNetCore.Annotations;

namespace ReviewService.Admin.Api.Controllers;

[ApiController]
[Route("api/flags")]
[Produces("application/json")]
[SwaggerTag("admin: CRUD флагов")]
[Authorize(Roles = "ADMIN,MANAGER")]
public sealed class FlagsController(IMapper mapper) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(GetFlagsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<GetFlagsResponse>> GetFlags(
        [FromServices] IGetAdminFlagsOperation operation,
        [FromQuery] string? q = null,
        [FromQuery] FlagCategoryDtoEnum? category = null,
        [FromQuery] int take = 50,
        [FromQuery] int pageNum = 1,
        CancellationToken ct = default)
    {
        var operationCategory = category.HasValue
            ? mapper.Map<FlagCategoryOperationEnum>(category.Value)
            : (FlagCategoryOperationEnum?)null;

        var result = await operation.GetAsync(
            new GetAdminFlagsOperationModel(q, operationCategory, take, pageNum),
            ct);

        if (result.IsFailure)
            return ToError<GetFlagsResponse>(result.Error, "get flags failed");

        return Ok(mapper.Map<GetFlagsResponse>(result.Value));
    }

    [HttpGet("{flagId:guid}")]
    [ProducesResponseType(typeof(AdminFlagDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AdminFlagDto>> GetFlag(
        [FromServices] IGetAdminFlagOperation operation,
        Guid flagId,
        CancellationToken ct = default)
    {
        var result = await operation.GetAsync(flagId, ct);

        if (result.IsFailure)
            return ToError<AdminFlagDto>(result.Error, "get flag failed");

        return Ok(mapper.Map<AdminFlagDto>(result.Value));
    }

    [HttpPost]
    [Consumes("application/json")]
    [ProducesResponseType(typeof(AdminFlagDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<AdminFlagDto>> CreateFlag(
        [FromServices] ICreateAdminFlagOperation operation,
        [FromBody] CreateFlagRequest request,
        CancellationToken ct)
    {
        var result = await operation.CreateAsync(
            mapper.Map<CreateAdminFlagOperationModel>(request),
            ct);

        if (result.IsFailure)
            return ToError<AdminFlagDto>(result.Error, "create flag failed");

        var response = mapper.Map<AdminFlagDto>(result.Value);

        return CreatedAtAction(nameof(GetFlag), new { flagId = response.FlagId }, response);
    }

    [HttpPut("{flagId:guid}")]
    [Consumes("application/json")]
    [ProducesResponseType(typeof(AdminFlagDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<AdminFlagDto>> UpdateFlag(
        [FromServices] IUpdateAdminFlagOperation operation,
        Guid flagId,
        [FromBody] UpdateFlagRequest request,
        CancellationToken ct)
    {
        var model = mapper.Map<UpdateAdminFlagOperationModel>(request) with
        {
            FlagId = flagId
        };

        var result = await operation.UpdateAsync(model, ct);

        if (result.IsFailure)
            return ToError<AdminFlagDto>(result.Error, "update flag failed");

        return Ok(mapper.Map<AdminFlagDto>(result.Value));
    }

    [HttpDelete("{flagId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteFlag(
        [FromServices] IDeleteAdminFlagOperation operation,
        Guid flagId,
        CancellationToken ct)
    {
        var result = await operation.DeleteAsync(flagId, ct);

        if (result.IsFailure)
            return ToError(result.Error, "delete flag failed");

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
