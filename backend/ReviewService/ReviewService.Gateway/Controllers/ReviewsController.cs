using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using ReviewService.Core.Abstractions.Enums;
using ReviewService.Core.Abstractions.Models;
using ReviewService.Core.Abstractions.Models.Reviews.CreateCompanyReview;
using ReviewService.Core.Abstractions.Models.Reviews.DeleteCompanyReview;
using ReviewService.Core.Abstractions.Models.Reviews.GetCompanyReviews;
using ReviewService.Core.Abstractions.Models.Reviews.GetMyReviews;
using ReviewService.Core.Abstractions.Models.Reviews.GetUserReviews;
using ReviewService.Core.Abstractions.Models.Reviews.ReportReview;
using ReviewService.Core.Abstractions.Models.Reviews.UpdateCompanyReview;
using ReviewService.Core.Abstractions.Operations;
using ReviewService.Core.Abstractions.Operations.Reviews;
using ReviewService.Gateway.DTOs;
using ReviewService.Gateway.DTOs.Reviews.CreateCompanyReview;
using ReviewService.Gateway.DTOs.Reviews.DeleteCompanyReview;
using ReviewService.Gateway.DTOs.Reviews.GetCompanyReviews;
using ReviewService.Gateway.DTOs.Reviews.GetUserReviews;
using Swashbuckle.AspNetCore.Annotations;

namespace ReviewService.Gateway.Controllers;

/// <summary>
/// отзывы: компании + пользовательские действия (списки, голос, жалоба).
/// </summary>
[ApiController]
[Route("api")]
[Produces("application/json")]
[SwaggerTag("отзывы: компании (crud/списки), пользователи (списки/голос/жалоба)")]
//[Authorize]
public sealed class ReviewsController(IMapper mapper) : ControllerBase
{
    /// <summary>
    /// POST .../companies/{companyId}/reviews — создание нового отзыва
    /// </summary>
    [HttpPost("companies/{companyId:guid}/reviews")]
    [Consumes("application/json")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [SwaggerOperation(Summary = "создание отзыва компании")]
    public async Task<IActionResult> CreateCompanyReview(
        [FromServices] ICreateCompanyReviewOperation operation,
        Guid companyId,
        [FromBody, SwaggerRequestBody("тело запроса", Required = true)]
        CreateCompanyReviewRequest request,
        CancellationToken ct)
    {
        if (request.CompanyId != companyId)
            return BadRequest(new ProblemDetails
            {
                Title = "companyId mismatch",
                Detail = "companyId в route не совпадает с companyId в body"
            });

        var model = mapper.Map<CreateCompanyReviewOperationModel>(request);
        var result = await operation.CreateAsync(model, ct);

        if (result.IsFailure)
            return BadRequest(new ProblemDetails
            {
                Title = "review create failed",
                Detail = result.Error.Message
            });

        return NoContent();
    }

    /// <summary>
    /// PATCH .../companies/reviews/{reviewId} — исправить отзыв в первые 5 минут
    /// </summary>
    [HttpPatch("companies/reviews/{reviewId:guid}")]
    [Consumes("application/json")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [SwaggerOperation(Summary = "правка отзыва (первые 5 минут)")]
    public async Task<IActionResult> PatchCompanyReview(
        [FromServices] IUpdateCompanyReviewOperation operation,
        Guid reviewId,
        [FromBody, SwaggerRequestBody("тело запроса", Required = true)]
        UpdateCompanyReviewRequest request,
        CancellationToken ct)
    {
        var model = mapper.Map<UpdateCompanyReviewOperationModel>(request) with { ReviewId = reviewId };
        var result = await operation.UpdateAsync(model, ct);

        if (result.IsFailure)
            return BadRequest(new ProblemDetails
            {
                Title = "review update failed",
                Detail = result.Error.Message
            });

        return NoContent();
    }

    /// <summary>
    /// DELETE .../companies/reviews/{reviewId} — удаление отзыва (когда угодно)
    /// </summary>
    [HttpDelete("companies/reviews/{reviewId:guid}")]
    [Consumes("application/json")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [SwaggerOperation(Summary = "удаление отзыва")]
    public async Task<IActionResult> DeleteCompanyReview(
        [FromServices] IDeleteCompanyReviewOperation operation,
        Guid reviewId,
        [FromBody, SwaggerRequestBody("тело запроса", Required = true)]
        DeleteCompanyReviewRequest request,
        CancellationToken ct)
    {
        var model = mapper.Map<DeleteCompanyReviewOperationModel>(request) with { ReviewId = reviewId };
        var result = await operation.DeleteAsync(model, ct);

        if (result.IsFailure)
            return BadRequest(new ProblemDetails
            {
                Title = "review delete failed",
                Detail = result.Error.Message
            });

        return NoContent();
    }

    /// <summary>
    /// GET .../companies/{companyId}/reviews?take=int&pageNum=int&sort=string(enum) — получить список отзывов
    /// </summary>
    [HttpGet("companies/{companyId:guid}/reviews")]
    [ProducesResponseType(typeof(GetCompanyReviewsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [SwaggerOperation(Summary = "список отзывов компании")]
    public async Task<ActionResult<GetCompanyReviewsResponse>> GetCompanyReviews(
        [FromServices] IGetCompanyReviewsOperation operation,
        Guid companyId,
        [FromQuery] int take = 20,
        [FromQuery] int pageNum = 1,
        [FromQuery] ReviewsSortGatewayEnum sort = ReviewsSortGatewayEnum.Newest,
        CancellationToken ct = default)
    {
        var model = new GetCompanyReviewsOperationModel(companyId, take, pageNum, mapper.Map<ReviewsSortOperationEnum>(sort));
        var result = await operation.GetAsync(model, ct);

        if (result.IsFailure)
            return BadRequest(new ProblemDetails
            {
                Title = "get reviews failed",
                Detail = result.Error.Message
            });

        return Ok(mapper.Map<GetCompanyReviewsResponse>(result.Value));
    }

    /// <summary>
    /// GET .../users/me/reviews?take=long&pageNum=long&sort=string(enum) — отзывы текущего пользователя
    /// </summary>
    [HttpGet("users/me/reviews")]
    [ProducesResponseType(typeof(GetUserReviewsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [SwaggerOperation(Summary = "отзывы текущего пользователя")]
    public async Task<ActionResult<GetUserReviewsResponse>> GetMyReviews(
        [FromServices] IGetMyReviewsOperation operation,
        [FromQuery] int take = 20,
        [FromQuery] int pageNum = 1,
        [FromQuery] ReviewsSortGatewayEnum sort = ReviewsSortGatewayEnum.Newest,
        CancellationToken ct = default)
    {
        var currentUserId = Guid.NewGuid(); // todo
        var model = new GetMyReviewsOperationModel(
            currentUserId,
            take,
            pageNum,
            mapper.Map<ReviewsSortOperationEnum>(sort));

        var result = await operation.GetAsync(model, ct);

        if (result.IsFailure)
            return BadRequest(new ProblemDetails
            {
                Title = "get my reviews failed",
                Detail = result.Error.Message
            });

        return Ok(mapper.Map<GetUserReviewsResponse>(result.Value));
    }

    /// <summary>
    /// GET .../users/{userId}/reviews?take=long&pageNum=long&sort=string(enum) — отзывы другого пользователя
    /// </summary>
    [HttpGet("users/{userId:guid}/reviews")]
    [ProducesResponseType(typeof(GetUserReviewsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [SwaggerOperation(Summary = "отзывы пользователя")]
    public async Task<ActionResult<GetUserReviewsResponse>> GetUserReviews(
        [FromServices] IGetUserReviewsOperation operation,
        Guid userId,
        [FromQuery] int take = 20,
        [FromQuery] int pageNum = 1,
        [FromQuery] ReviewsSortGatewayEnum sort = ReviewsSortGatewayEnum.Newest,
        CancellationToken ct = default)
    {
        var model = new GetUserReviewsOperationModel(userId, take, pageNum, mapper.Map<ReviewsSortOperationEnum>(sort));
        var result = await operation.GetAsync(model, ct);

        if (result.IsFailure)
            return BadRequest(new ProblemDetails
            {
                Title = "get user reviews failed",
                Detail = result.Error.Message
            });

        return Ok(mapper.Map<GetUserReviewsResponse>(result.Value));
    }

    /// <summary>
    /// PATCH .../users/reviews/{reviewId}/vote — лайк/дизлайк
    /// </summary>
    [HttpPatch("users/reviews/{reviewId:guid}/vote")]
    [Consumes("application/json")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [SwaggerOperation(Summary = "лайк/дизлайк отзыва")]
    public async Task<IActionResult> VoteReview(
        [FromServices] IVoteReviewOperation operation,
        Guid reviewId,
        [FromBody, SwaggerRequestBody("тело запроса", Required = true)]
        VoteReviewRequest request,
        CancellationToken ct)
    {
        var model = mapper.Map<VoteReviewOperationModel>(request) with { ReviewId = reviewId };
        var result = await operation.VoteAsync(model, ct);

        if (result.IsFailure)
            return BadRequest(new ProblemDetails
            {
                Title = "vote failed",
                Detail = result.Error.Message
            });

        return NoContent();
    }

    /// <summary>
    /// POST .../users/reviews/{reviewId}/report — жалоба на отзыв
    /// </summary>
    [HttpPost("users/reviews/{reviewId:guid}/report")]
    [Consumes("application/json")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [SwaggerOperation(Summary = "жалоба на отзыв")]
    public async Task<IActionResult> ReportReview(
        [FromServices] IReportReviewOperation operation,
        Guid reviewId,
        [FromBody, SwaggerRequestBody("тело запроса", Required = true)]
        ReportReviewRequest request,
        CancellationToken ct)
    {
        var model = mapper.Map<ReportReviewOperationModel>(request) with { ReviewId = reviewId };
        var result = await operation.ReportAsync(model, ct);

        if (result.IsFailure)
            return BadRequest(new ProblemDetails
            {
                Title = "report failed",
                Detail = result.Error.Message
            });

        return NoContent();
    }
}