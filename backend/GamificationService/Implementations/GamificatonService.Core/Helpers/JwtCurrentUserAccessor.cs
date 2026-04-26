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

        if (TryGetGuidClaim(user, JwtRegisteredClaimNames.Sub, out var userId) ||
            TryGetGuidClaim(user, ClaimTypes.NameIdentifier, out userId) ||
            TryGetGuidClaim(user, "userId", out userId))
        {
            return userId;
        }

        throw new UnauthorizedAccessException("invalid jwt: user id claim is missing or not a guid");
    }

    private static bool TryGetGuidClaim(ClaimsPrincipal user, string claimType, out Guid userId) =>
        Guid.TryParse(user.FindFirst(claimType)?.Value, out userId);
}
