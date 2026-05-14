using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReviewService.Admin.Api.DTOs.Reviews;
using ReviewService.Core.Abstractions.Models.Admin.Reviews;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Abstractions.Operations.Admin.Reviews;
using Swashbuckle.AspNetCore.Annotations;

namespace ReviewService.Admin.Api.Controllers;

[ApiController]
[Route("api/admin/review-reports")]
[Produces("application/json")]
[SwaggerTag("admin: жалобы по отзывам")]
[Authorize(Roles = "ADMIN,MANAGER")]
public sealed class ReviewReportsController(IMapper mapper) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(GetReviewReportsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<GetReviewReportsResponse>> GetReports(
        [FromServices] IGetAdminReviewReportsOperation operation,
        [FromQuery] string? reasonType = null,
        [FromQuery] int take = 20,
        [FromQuery] int pageNum = 1,
        CancellationToken ct = default)
    {
        var result = await operation.GetAsync(
            new GetAdminReviewReportsOperationModel(reasonType, take, pageNum),
            ct);

        if (result.IsFailure)
            return ToError<GetReviewReportsResponse>(result.Error, "get review reports failed");

        return Ok(mapper.Map<GetReviewReportsResponse>(result.Value));
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
