using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using GamificatonService.Core.Abstractions.Helpers;

namespace GamificatonService.Core.Helpers;

internal sealed class JwtCurrentUserAccessor : ICurrentUserAccessor
{
    public Guid GetRequiredUserId(ClaimsPrincipal user)
    {
        if (user.Identity?.IsAuthenticated != true)
            throw new UnauthorizedAccessException("unauthorized");

        var sub = user.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

        if (Guid.TryParse(sub, out var userId))
            return userId;

        // fallback: если кто-то кладёт userId отдельным claim'ом
        var alt = user.FindFirst("userId")?.Value;
        if (Guid.TryParse(alt, out userId))
            return userId;

        throw new UnauthorizedAccessException("invalid jwt: user id claim is missing or not a guid");
    }
}