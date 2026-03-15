using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using GamificatonService.Gateway.Options;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Swashbuckle.AspNetCore.Annotations;

namespace GamificatonService.Gateway.Controllers;

/// <summary>
/// тестовая авторизация: выдача jwt и проверка доступа.
/// </summary>
[ApiController]
[Route("api/test-auth")]
[Produces("application/json")]
[SwaggerTag("тестовая jwt авторизация")]
public sealed class TestAuthController(IOptions<JwtOptions> jwtOptions) : ControllerBase
{
    private static readonly Guid TestUserId = Guid.Parse("4d3f9d74-c4cb-4e6f-8d31-4ef4c2eaa101");

    /// <summary>
    /// выдаёт тестовый jwt для захардкоженного пользователя.
    /// </summary>
    [HttpPost("token")]
    [ProducesResponseType(typeof(IssueTokenResponse), StatusCodes.Status200OK)]
    [SwaggerOperation(
        Summary = "выдать тестовый jwt",
        Description = "генерирует jwt с claim sub=userId. использует SecretKey из JwtOptions."
    )]
    public ActionResult<IssueTokenResponse> IssueToken(
        [FromQuery] int expiresMinutes = 60)
    {
        var secretKey = jwtOptions.Value.SecretKey;

        if (string.IsNullOrWhiteSpace(secretKey))
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "jwt secret key is empty",
                Detail = "configure JwtOptions:SecretKey"
            });

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var now = DateTime.UtcNow;
        var expires = now.AddMinutes(Math.Clamp(expiresMinutes, 1, 24 * 60));

        var claims = new List<Claim>
        {
            // стандартно: sub = subject (user id)
            new(JwtRegisteredClaimNames.Sub, TestUserId.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(JwtRegisteredClaimNames.Iat, ToUnixTimeSeconds(now).ToString(), ClaimValueTypes.Integer64),

            // удобно для дебага
            new("userId", TestUserId.ToString())
        };

        var token = new JwtSecurityToken(
            claims: claims,
            notBefore: now,
            expires: expires,
            signingCredentials: creds);

        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

        return Ok(new IssueTokenResponse
        {
            AccessToken = $"Bearer {tokenString}",
            TokenType = "Bearer",
            ExpiresAtUtc = expires
        });
    }

    /// <summary>
    /// защищённый эндпоинт: возвращает userId из токена.
    /// </summary>
    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType(typeof(MeResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [SwaggerOperation(
        Summary = "проверка jwt",
        Description = "требует Bearer токен. возвращает userId из claims."
    )]
    public ActionResult<MeResponse> Me()
    {
        var sub = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var userId = User.FindFirstValue("userId");

        return Ok(new MeResponse
        {
            Subject = sub,
            UserId = userId,
            IsAuthenticated = User.Identity?.IsAuthenticated ?? false
        });
    }

    private static long ToUnixTimeSeconds(DateTime utc)
        => new DateTimeOffset(utc, TimeSpan.Zero).ToUnixTimeSeconds();
}

public sealed record IssueTokenResponse
{
    public required string AccessToken { get; init; }
    public required string TokenType { get; init; }
    public required DateTime ExpiresAtUtc { get; init; }
}

public sealed record MeResponse
{
    public required bool IsAuthenticated { get; init; }
    public string? Subject { get; init; }
    public string? UserId { get; init; }
}