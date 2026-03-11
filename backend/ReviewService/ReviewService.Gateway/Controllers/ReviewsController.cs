using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReviewService.Core.Abstractions.Enums;
using ReviewService.Core.Abstractions.Helpers;
using ReviewService.Core.Abstractions.Models.Reviews;
using ReviewService.Core.Abstractions.Models.Reviews.CreateCompanyReview;
using ReviewService.Core.Abstractions.Models.Reviews.DeleteCompanyReview;
using ReviewService.Core.Abstractions.Models.Reviews.GetCompanyReviews;
using ReviewService.Core.Abstractions.Models.Reviews.GetMyReviews;
using ReviewService.Core.Abstractions.Models.Reviews.GetUserReviews;
using ReviewService.Core.Abstractions.Models.Reviews.ReportReview;
using ReviewService.Core.Abstractions.Models.Reviews.UpdateCompanyReview;
using ReviewService.Core.Abstractions.Operations.Reviews;
using ReviewService.Gateway.DTOs;
using ReviewService.Gateway.DTOs.Reviews.CreateCompanyReview;
using ReviewService.Gateway.DTOs.Reviews.DeleteCompanyReview;
using ReviewService.Gateway.DTOs.Reviews.GetCompanyReviews;
using ReviewService.Gateway.DTOs.Reviews.GetUserReviews;
using Swashbuckle.AspNetCore.Annotations;

namespace ReviewService.Gateway.Controllers;

[ApiController]
[Route("api")]
[Produces("application/json")]
[SwaggerTag("отзывы: компании (crud/списки), пользователи (списки/голос/жалоба)")]
[Authorize]
public sealed class ReviewsController(IMapper mapper) : ControllerBase
{
    [HttpPost("companies/{companyId:guid}/reviews")]
    [Consumes("application/json")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> CreateCompanyReview(
        [FromServices] ICreateCompanyReviewOperation operation,
        [FromServices] ICurrentUserAccessor currentUserAccessor,
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

        var currentUserId = currentUserAccessor.GetRequiredUserId(User);

        var model = mapper.Map<CreateCompanyReviewOperationModel>(request) with
        {
            UserId = currentUserId
        };

        var result = await operation.CreateAsync(model, ct);

        if (result.IsFailure)
            return BadRequest(new ProblemDetails { Title = "review create failed", Detail = result.Error.Message });

        return NoContent();
    }

    [HttpPatch("companies/reviews/{reviewId:guid}")]
    [Consumes("application/json")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> PatchCompanyReview(
        [FromServices] IUpdateCompanyReviewOperation operation,
        [FromServices] ICurrentUserAccessor currentUserAccessor,
        Guid reviewId,
        [FromBody, SwaggerRequestBody("тело запроса", Required = true)]
        UpdateCompanyReviewRequest request,
        CancellationToken ct)
    {
        var currentUserId = currentUserAccessor.GetRequiredUserId(User);

        var model = mapper.Map<UpdateCompanyReviewOperationModel>(request) with
        {
            ReviewId = reviewId,
            UserId = currentUserId
        };

        var result = await operation.UpdateAsync(model, ct);

        if (result.IsFailure)
            return BadRequest(new ProblemDetails { Title = "review update failed", Detail = result.Error.Message });

        return NoContent();
    }

    [HttpDelete("companies/reviews/{reviewId:guid}")]
    [Consumes("application/json")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteCompanyReview(
        [FromServices] IDeleteCompanyReviewOperation operation,
        [FromServices] ICurrentUserAccessor currentUserAccessor,
        Guid reviewId,
        [FromBody, SwaggerRequestBody("тело запроса", Required = true)]
        DeleteCompanyReviewRequest request,
        CancellationToken ct)
    {
        var currentUserId = currentUserAccessor.GetRequiredUserId(User);
        var model = new DeleteCompanyReviewOperationModel { ReviewId = reviewId, UserId = currentUserId };

        var result = await operation.DeleteAsync(model, ct);

        if (result.IsFailure)
            return BadRequest(new ProblemDetails { Title = "review delete failed", Detail = result.Error.Message });

        return NoContent();
    }

    [HttpGet("companies/{companyId:guid}/reviews")]
    [ProducesResponseType(typeof(GetCompanyReviewsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<GetCompanyReviewsResponse>> GetCompanyReviews(
        [FromServices] IGetCompanyReviewsOperation operation,
        Guid companyId,
        [FromQuery] int take = 20,
        [FromQuery] int pageNum = 1,
        [FromQuery] ReviewsSortGatewayEnum sort = ReviewsSortGatewayEnum.Newest,
        CancellationToken ct = default)
    {
        var model = new GetCompanyReviewsOperationModel(
            companyId,
            take,
            pageNum,
            mapper.Map<ReviewsSortOperationEnum>(sort));

        var result = await operation.GetAsync(model, ct);

        if (result.IsFailure)
            return BadRequest(new ProblemDetails { Title = "get reviews failed", Detail = result.Error.Message });

        return Ok(mapper.Map<GetCompanyReviewsResponse>(result.Value));
    }

    [HttpGet("users/me/reviews")]
    [ProducesResponseType(typeof(GetUserReviewsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<GetUserReviewsResponse>> GetMyReviews(
        [FromServices] IGetMyReviewsOperation operation,
        [FromServices] ICurrentUserAccessor currentUserAccessor,
        [FromQuery] int take = 20,
        [FromQuery] int pageNum = 1,
        [FromQuery] ReviewsSortGatewayEnum sort = ReviewsSortGatewayEnum.Newest,
        CancellationToken ct = default)
    {
        var currentUserId = currentUserAccessor.GetRequiredUserId(User);

        var model = new GetMyReviewsOperationModel(
            currentUserId,
            take,
            pageNum,
            mapper.Map<ReviewsSortOperationEnum>(sort));

        var result = await operation.GetAsync(model, ct);

        if (result.IsFailure)
            return BadRequest(new ProblemDetails { Title = "get my reviews failed", Detail = result.Error.Message });

        return Ok(mapper.Map<GetUserReviewsResponse>(result.Value));
    }

    [HttpGet("users/{userId:guid}/reviews")]
    [ProducesResponseType(typeof(GetUserReviewsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<GetUserReviewsResponse>> GetUserReviews(
        [FromServices] IGetUserReviewsOperation operation,
        Guid userId,
        [FromQuery] int take = 20,
        [FromQuery] int pageNum = 1,
        [FromQuery] ReviewsSortGatewayEnum sort = ReviewsSortGatewayEnum.Newest,
        CancellationToken ct = default)
    {
        var model = new GetUserReviewsOperationModel(
            userId,
            take,
            pageNum,
            mapper.Map<ReviewsSortOperationEnum>(sort));

        var result = await operation.GetAsync(model, ct);

        if (result.IsFailure)
            return BadRequest(new ProblemDetails { Title = "get user reviews failed", Detail = result.Error.Message });

        return Ok(mapper.Map<GetUserReviewsResponse>(result.Value));
    }

    [HttpPatch("users/reviews/{reviewId:guid}/vote")]
    [Consumes("application/json")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> VoteReview(
        [FromServices] IVoteReviewOperation operation,
        [FromServices] ICurrentUserAccessor currentUserAccessor,
        Guid reviewId,
        [FromBody, SwaggerRequestBody("тело запроса", Required = true)]
        VoteReviewRequest request,
        CancellationToken ct)
    {
        var currentUserId = currentUserAccessor.GetRequiredUserId(User);

        var model = mapper.Map<VoteReviewOperationModel>(request) with
        {
            ReviewId = reviewId,
            UserId = currentUserId
        };

        var result = await operation.VoteAsync(model, ct);

        if (result.IsFailure)
            return BadRequest(new ProblemDetails { Title = "vote failed", Detail = result.Error.Message });

        return NoContent();
    }

    [HttpPost("users/reviews/{reviewId:guid}/report")]
    [Consumes("application/json")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ReportReview(
        [FromServices] IReportReviewOperation operation,
        [FromServices] ICurrentUserAccessor currentUserAccessor,
        Guid reviewId,
        [FromBody, SwaggerRequestBody("тело запроса", Required = true)]
        ReportReviewRequest request,
        CancellationToken ct)
    {
        var currentUserId = currentUserAccessor.GetRequiredUserId(User);

        var model = mapper.Map<ReportReviewOperationModel>(request) with
        {
            ReviewId = reviewId,
            UserId = currentUserId
        };

        var result = await operation.ReportAsync(model, ct);

        if (result.IsFailure)
            return BadRequest(new ProblemDetails { Title = "report failed", Detail = result.Error.Message });

        return NoContent();
    }
}