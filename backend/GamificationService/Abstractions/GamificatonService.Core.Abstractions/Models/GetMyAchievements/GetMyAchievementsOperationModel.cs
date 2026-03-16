using GamificatonService.Core.Abstractions.Enums;

namespace GamificatonService.Core.Abstractions.Models.GetMyAchievements;

public sealed record GetMyAchievementsOperationModel(
    Guid CurrentUserId,
    int Take,
    int PageNum,
    MyAchievementsFilterStatusOperationEnum Status);