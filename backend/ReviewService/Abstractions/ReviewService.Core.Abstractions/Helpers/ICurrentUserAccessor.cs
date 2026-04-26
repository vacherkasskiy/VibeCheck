using System.Security.Claims;

namespace ReviewService.Core.Abstractions.Helpers;

public interface ICurrentUserAccessor
{
    /// <summary>
    /// возвращает userId из jwt или бросает UnauthorizedAccessException.
    /// </summary>
    Guid GetRequiredUserId(ClaimsPrincipal user);
}