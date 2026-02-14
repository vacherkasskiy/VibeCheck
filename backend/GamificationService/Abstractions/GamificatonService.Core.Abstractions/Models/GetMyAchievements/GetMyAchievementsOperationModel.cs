using GamificatonService.Core.Abstractions.Enums;

namespace GamificatonService.Core.Abstractions.Models.GetMyAchievements;

public sealed record GetMyAchievementsOperationModel(
    int Take,
    int PageNum,
    MyAchievementsFilterStatusOperationEnum Status);