using GamificatonService.PersistentStorage.Abstractions.Enums;

namespace GamificatonService.PersistentStorage.Abstractions.Models.GetMyAchievements;

public sealed record GetMyAchievementsRepositoryInputModel
{
    public required Guid UserId { get; init; }
    public required int Take { get; init; }
    public required int PageNum { get; init; }
    public required MyAchievementsFilterStatusRepositoryEnum Status { get; init; }
}