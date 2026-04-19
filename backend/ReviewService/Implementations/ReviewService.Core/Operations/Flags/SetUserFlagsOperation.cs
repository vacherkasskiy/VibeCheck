using ReviewService.Core.Abstractions.Models.Flags;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Abstractions.Operations.Flags;
using ReviewService.PersistentStorage.Abstractions.Models.Flags;
using ReviewService.PersistentStorage.Abstractions.Repositories.Flags;

namespace ReviewService.Core.Operations.Flags;

internal sealed class SetUserFlagsOperation(
    IUserFlagsCommandRepository userFlagsCommandRepository,
    IFlagsValidationQueryRepository flagsValidationQueryRepository)
    : ISetUserFlagsOperation
{
    public async Task<Result> ExecuteAsync(
        Guid userId,
        SetUserFlagsOperationModel model,
        CancellationToken ct)
    {
        if (userId == Guid.Empty)
            return Result.Failure(Error.Validation("user id is required"));

        if (model.GreenFlags is null || model.GreenFlags.Count == 0)
            return Result.Failure(Error.Validation("at least one green flag is required"));

        if (model.RedFlags is null || model.RedFlags.Count == 0)
            return Result.Failure(Error.Validation("at least one red flag is required"));

        var repositoryModels = new List<ReplaceUserFlagRepositoryModel>();

        var greenResult = ConvertGroups(
            model.GreenFlags,
            UserFlagColorOperationEnum.Green);

        if (greenResult.IsFailure)
            return Result.Failure(greenResult.Error);

        repositoryModels.AddRange(greenResult.Value);

        var redResult = ConvertGroups(
            model.RedFlags,
            UserFlagColorOperationEnum.Red);

        if (redResult.IsFailure)
            return Result.Failure(redResult.Error);

        repositoryModels.AddRange(redResult.Value);

        if (repositoryModels.Count == 0)
            return Result.Failure(Error.Validation("at least one flag must be selected"));

        var duplicateFlagIds = repositoryModels
            .GroupBy(x => x.FlagId)
            .Where(x => x.Count() > 1)
            .Select(x => x.Key)
            .ToArray();

        if (duplicateFlagIds.Length > 0)
            return Result.Failure(Error.Validation("duplicate flags are not allowed"));

        var flagIds = repositoryModels
            .Select(x => x.FlagId)
            .Distinct()
            .ToArray();

        var existingFlagIds = await flagsValidationQueryRepository.GetExistingFlagIdsAsync(flagIds, ct);

        var missingFlagIds = flagIds
            .Except(existingFlagIds)
            .ToArray();

        if (missingFlagIds.Length > 0)
            return Result.Failure(Error.Validation("one or more flags do not exist"));

        await userFlagsCommandRepository.ReplaceUserFlagsAsync(userId, repositoryModels, ct);

        return Result.Success();
    }

    private static Result<IReadOnlyCollection<ReplaceUserFlagRepositoryModel>> ConvertGroups(
        IReadOnlyCollection<SetUserFlagGroupOperationModel> groups,
        UserFlagColorOperationEnum color)
    {
        var result = new List<ReplaceUserFlagRepositoryModel>();

        foreach (var group in groups)
        {
            if (group.Weight < 1 || group.Weight > 3)
            {
                return Result<IReadOnlyCollection<ReplaceUserFlagRepositoryModel>>.Failure(
                    Error.Validation("weight must be in range [1, 3]"));
            }

            if (group.Flags is null || group.Flags.Count == 0)
            {
                return Result<IReadOnlyCollection<ReplaceUserFlagRepositoryModel>>.Failure(
                    Error.Validation("flag group must contain at least one flag"));
            }

            foreach (var flagId in group.Flags)
            {
                if (flagId == Guid.Empty)
                {
                    return Result<IReadOnlyCollection<ReplaceUserFlagRepositoryModel>>.Failure(
                        Error.Validation("flag id must not be empty"));
                }

                result.Add(new ReplaceUserFlagRepositoryModel
                {
                    FlagId = flagId,
                    Color = MapColor(color),
                    Weight = group.Weight
                });
            }
        }

        return Result<IReadOnlyCollection<ReplaceUserFlagRepositoryModel>>.Success(result);
    }

    private static UserFlagColorRepositoryEnum MapColor(UserFlagColorOperationEnum color)
    {
        return color switch
        {
            UserFlagColorOperationEnum.Green => UserFlagColorRepositoryEnum.Green,
            UserFlagColorOperationEnum.Red => UserFlagColorRepositoryEnum.Red,
            _ => throw new ArgumentOutOfRangeException(nameof(color), color, null)
        };
    }
}