using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Abstractions.Operations.Admin.Reviews;
using Swashbuckle.AspNetCore.Annotations;

namespace ReviewService.Admin.Api.Controllers;

[ApiController]
[Route("api/admin/reviews")]
[Produces("application/json")]
[SwaggerTag("admin: модерация отзывов")]
[Authorize(Roles = "ADMIN,MANAGER")]
public sealed class ReviewsController : ControllerBase
{
    [HttpDelete("{reviewId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteReview(
        [FromServices] IAdminDeleteReviewOperation operation,
        Guid reviewId,
        CancellationToken ct)
    {
        var result = await operation.DeleteAsync(reviewId, ct);

        if (result.IsFailure)
            return ToError(result.Error, "delete review failed");

        return NoContent();
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
