using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using ReviewService.Core.Abstractions.Models;
using ReviewService.Core.Abstractions.Operations;
using ReviewService.Gateway.DTOs;
using Swashbuckle.AspNetCore.Annotations;
using ReviewsSort = ReviewService.Gateway.DTOs.ReviewsSort;

namespace ReviewService.Gateway.Controllers;

/// <summary>
/// компании и отзывы.
/// </summary>
/// <remarks>
/// эндпоинты строго по твоей спецификации: создание/правка/удаление/получение списка отзывов по компании,
/// а также эндпоинты пользователя: список своих/чужих отзывов, голосование, жалоба.
/// </remarks>
[ApiController]
[Route("api")]
[Produces("application/json")]
[SwaggerTag("компании: отзывы (crud + списки), пользователи: отзывы (списки/голоса/жалобы)")]
//[Authorize]
public sealed class CompaniesController(IMapper mapper) : ControllerBase
{
    /// <summary>
    /// создание нового отзыва компании.
    /// </summary>
    [HttpPost("companies/{companyId:guid}/reviews")]
    [Consumes("application/json")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [SwaggerOperation(
        Summary = "создание нового отзыва",
        Description = "создаёт отзыв о компании. accessToken обязателен."
    )]
    public async Task<IActionResult> CreateCompanyReview(
        [FromServices] ICreateCompanyReviewOperation operation,
        Guid companyId,
        [FromBody, SwaggerRequestBody("данные отзыва", Required = true)]
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
    /// исправить отзыв в первые 5 минут.
    /// </summary>
    [HttpPatch("companies/reviews/{reviewId:guid}")]
    [Consumes("application/json")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [SwaggerOperation(
        Summary = "правка отзыва",
        Description = "разрешено исправлять отзыв только в первые 5 минут (проверяется в домене/операции)."
    )]
    public async Task<IActionResult> PatchCompanyReview(
        [FromServices] IUpdateCompanyReviewOperation operation,
        Guid reviewId,
        [FromBody, SwaggerRequestBody("данные для правки", Required = true)]
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
    /// удаление отзыва когда угодно.
    /// </summary>
    [HttpDelete("companies/reviews/{reviewId:guid}")]
    [Consumes("application/json")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [SwaggerOperation(
        Summary = "удаление отзыва",
        Description = "удаляет отзыв. проверка прав/владельца — на стороне операции."
    )]
    public async Task<IActionResult> DeleteCompanyReview(
        [FromServices] IDeleteCompanyReviewOperation operation,
        Guid reviewId,
        [FromBody, SwaggerRequestBody("данные для удаления", Required = true)]
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
    /// получить список отзывов компании.
    /// </summary>
    [HttpGet("companies/{companyId:guid}/reviews")]
    [ProducesResponseType(typeof(GetCompanyReviewsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [SwaggerOperation(
        Summary = "список отзывов компании",
        Description = "пагинация take/pageNum, сортировка sort."
    )]
    public async Task<ActionResult<GetCompanyReviewsResponse>> GetCompanyReviews(
        [FromServices] IGetCompanyReviewsOperation operation,
        Guid companyId,
        [FromQuery] int take = 20,
        [FromQuery] int pageNum = 1,
        [FromQuery] ReviewsSort sort = ReviewsSort.Newest,
        CancellationToken ct = default)
    {
        var model = new GetCompanyReviewsOperationModel(
            companyId,
            take,
            pageNum,
            mapper.Map<ReviewsSortOperationEnum>(sort));
        
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
    /// получить отзывы текущего юзера.
    /// </summary>
    [HttpGet("users/me/reviews")]
    [ProducesResponseType(typeof(GetUserReviewsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [SwaggerOperation(
        Summary = "отзывы текущего пользователя",
        Description = "пагинация take/pageNum, сортировка sort."
    )]
    public async Task<ActionResult<GetUserReviewsResponse>> GetMyReviews(
        [FromServices] IGetMyReviewsOperation operation,
        [FromQuery] int take = 20,
        [FromQuery] int pageNum = 1,
        [FromQuery] ReviewsSort sort = ReviewsSort.Newest,
        CancellationToken ct = default)
    {
        var model = new GetMyReviewsOperationModel(take, pageNum, mapper.Map<ReviewsSortOperationEnum>(sort));
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
    /// получить отзывы другого юзера.
    /// </summary>
    [HttpGet("users/{userId:guid}/reviews")]
    [ProducesResponseType(typeof(GetUserReviewsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [SwaggerOperation(
        Summary = "отзывы пользователя",
        Description = "пагинация take/pageNum, сортировка sort."
    )]
    public async Task<ActionResult<GetUserReviewsResponse>> GetUserReviews(
        [FromServices] IGetUserReviewsOperation operation,
        Guid userId,
        [FromQuery] int take = 20,
        [FromQuery] int pageNum = 1,
        [FromQuery] ReviewsSort sort = ReviewsSort.Newest,
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
    /// лайк/дизлайк отзыва.
    /// </summary>
    [HttpPatch("users/reviews/{reviewId:guid}/vote")]
    [Consumes("application/json")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [SwaggerOperation(
        Summary = "голосование за отзыв",
        Description = "mode: like/dislike/clear (если нужно)."
    )]
    public async Task<IActionResult> VoteReview(
        [FromServices] IVoteReviewOperation operation,
        Guid reviewId,
        [FromBody, SwaggerRequestBody("режим голосования", Required = true)]
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
    /// жалоба на отзыв.
    /// </summary>
    [HttpPost("users/reviews/{reviewId:guid}/report")]
    [Consumes("application/json")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [SwaggerOperation(
        Summary = "жалоба на отзыв",
        Description = "reasonType + опциональный reasonText."
    )]
    public async Task<IActionResult> ReportReview(
        [FromServices] IReportReviewOperation operation,
        Guid reviewId,
        [FromBody, SwaggerRequestBody("данные жалобы", Required = true)]
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