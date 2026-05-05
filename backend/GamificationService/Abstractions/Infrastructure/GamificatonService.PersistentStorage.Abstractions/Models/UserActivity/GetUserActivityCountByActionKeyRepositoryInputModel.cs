namespace GamificatonService.PersistentStorage.Abstractions.Models.UserActivity;


public sealed record GetUserActivityCountByActionKeyRepositoryInputModel
{
    public required Guid UserId { get; init; }
    public required string ActionKey { get; init; }
}