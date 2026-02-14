namespace GamificatonService.Core.Abstractions.Models.GetUserAchievements;

public sealed record GetUserAchievementsOperationModel(
    Guid UserId,
    long Take,
    long PageNum);