using System.Security.Claims;

namespace GamificatonService.Core.Abstractions.Helpers;

public interface ICurrentUserAccessor
{
    /// <summary>
    /// возвращает userId из jwt или бросает UnauthorizedAccessException.
    /// </summary>
    Guid GetRequiredUserId(ClaimsPrincipal user);
}