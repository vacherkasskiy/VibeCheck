using ReviewService.Core.Abstractions.Models.Admin.Flags;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Abstractions.Operations.Admin.Flags;
using ReviewService.PersistentStorage.Abstractions.Models.Admin.Flags;
using ReviewService.PersistentStorage.Abstractions.Repositories.Admin.Flags;
using OperationFlagCategory = ReviewService.Core.Abstractions.Models.Flags.FlagCategoryOperationEnum;
using RepositoryFlagCategory = ReviewService.PersistentStorage.Abstractions.Models.Admin.Flags.FlagCategoryRepositoryEnum;

namespace ReviewService.Core.Operations.Admin.Flags;

internal sealed class AdminFlagsOperations(
    IAdminFlagsQueryRepository queryRepository,
    IAdminFlagsCommandRepository commandRepository)
    : IGetAdminFlagsOperation,
        IGetAdminFlagOperation,
        ICreateAdminFlagOperation,
        IUpdateAdminFlagOperation,
        IDeleteAdminFlagOperation
{
    public async Task<Result<AdminFlagsPageOperationModel>> GetAsync(
        GetAdminFlagsOperationModel model,
        CancellationToken ct)
    {
        var repoResult = await queryRepository.GetFlagsAsync(
            new GetAdminFlagsRepositoryInputModel
            {
                Q = model.Q,
                Category = model.Category.HasValue ? MapCategory(model.Category.Value) : null,
                Take = model.Take,
                PageNum = model.PageNum
            },
            ct);

        return new AdminFlagsPageOperationModel
        {
            TotalCount = repoResult.TotalCount,
            Flags = repoResult.Flags.Select(MapFlag).ToArray()
        };
    }

    public async Task<Result<AdminFlagOperationModel>> GetAsync(Guid flagId, CancellationToken ct)
    {
        if (flagId == Guid.Empty)
            return Error.Validation("flagId is required");

        var flag = await queryRepository.GetFlagAsync(flagId, ct);

        if (flag is null)
            return Error.NotFound("flag not found");

        return MapFlag(flag);
    }

    public async Task<Result<AdminFlagOperationModel>> CreateAsync(
        CreateAdminFlagOperationModel model,
        CancellationToken ct)
    {
        var validation = await ValidateFlagModelAsync(
            model.Name,
            model.Description,
            null,
            ct);

        if (validation is not null)
            return validation;

        var flag = await commandRepository.CreateAsync(
            new UpsertAdminFlagRepositoryModel
            {
                Name = model.Name.Trim(),
                Category = MapCategory(model.Category),
                Description = model.Description.Trim()
            },
            DateTime.UtcNow,
            ct);

        return MapFlag(flag);
    }

    public async Task<Result<AdminFlagOperationModel>> UpdateAsync(
        UpdateAdminFlagOperationModel model,
        CancellationToken ct)
    {
        if (model.FlagId == Guid.Empty)
            return Error.Validation("flagId is required");

        var validation = await ValidateFlagModelAsync(
            model.Name,
            model.Description,
            model.FlagId,
            ct);

        if (validation is not null)
            return validation;

        var flag = await commandRepository.UpdateAsync(
            model.FlagId,
            new UpsertAdminFlagRepositoryModel
            {
                Name = model.Name.Trim(),
                Category = MapCategory(model.Category),
                Description = model.Description.Trim()
            },
            ct);

        if (flag is null)
            return Error.NotFound("flag not found");

        return MapFlag(flag);
    }

    public async Task<Result> DeleteAsync(Guid flagId, CancellationToken ct)
    {
        if (flagId == Guid.Empty)
            return Error.Validation("flagId is required");

        var flag = await queryRepository.GetFlagAsync(flagId, ct);

        if (flag is null)
            return Error.NotFound("flag not found");

        var isUsed = await queryRepository.FlagIsUsedAsync(flagId, ct);

        if (isUsed)
            return Error.Validation("flag is used");

        await commandRepository.DeleteAsync(flagId, ct);

        return Result.Success();
    }

    private async Task<Error?> ValidateFlagModelAsync(
        string? name,
        string? description,
        Guid? exceptFlagId,
        CancellationToken ct)
    {
        var normalizedName = name?.Trim() ?? string.Empty;
        var normalizedDescription = description?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(normalizedName))
            return Error.Validation("name is required");

        if (normalizedName.Length > 128)
            return Error.Validation("name is too long");

        if (string.IsNullOrWhiteSpace(normalizedDescription))
            return Error.Validation("description is required");

        var exists = await queryRepository.FlagExistsByNameAsync(
            normalizedName,
            exceptFlagId,
            ct);

        return exists ? Error.Conflict("flag already exists") : null;
    }

    private static AdminFlagOperationModel MapFlag(AdminFlagRepositoryModel flag) =>
        new()
        {
            FlagId = flag.FlagId,
            Name = flag.Name,
            Category = MapCategory(flag.Category),
            Description = flag.Description,
            CreatedAt = ToDateTimeOffsetUtc(flag.CreatedAtUtc)
        };

    private static OperationFlagCategory MapCategory(RepositoryFlagCategory category) => category switch
    {
        RepositoryFlagCategory.Culture => OperationFlagCategory.Culture,
        RepositoryFlagCategory.Management => OperationFlagCategory.Management,
        RepositoryFlagCategory.Processes => OperationFlagCategory.Processes,
        RepositoryFlagCategory.Communications => OperationFlagCategory.Communications,
        RepositoryFlagCategory.Image => OperationFlagCategory.Image,
        RepositoryFlagCategory.Compensation => OperationFlagCategory.Compensation,
        RepositoryFlagCategory.Career => OperationFlagCategory.Career,
        RepositoryFlagCategory.Balance => OperationFlagCategory.Balance,
        RepositoryFlagCategory.Conditions => OperationFlagCategory.Conditions,
        RepositoryFlagCategory.Values => OperationFlagCategory.Values,
        _ => throw new ArgumentOutOfRangeException(nameof(category), category, "unknown flag category")
    };

    private static RepositoryFlagCategory MapCategory(OperationFlagCategory category) => category switch
    {
        OperationFlagCategory.Culture => RepositoryFlagCategory.Culture,
        OperationFlagCategory.Management => RepositoryFlagCategory.Management,
        OperationFlagCategory.Processes => RepositoryFlagCategory.Processes,
        OperationFlagCategory.Communications => RepositoryFlagCategory.Communications,
        OperationFlagCategory.Image => RepositoryFlagCategory.Image,
        OperationFlagCategory.Compensation => RepositoryFlagCategory.Compensation,
        OperationFlagCategory.Career => RepositoryFlagCategory.Career,
        OperationFlagCategory.Balance => RepositoryFlagCategory.Balance,
        OperationFlagCategory.Conditions => RepositoryFlagCategory.Conditions,
        OperationFlagCategory.Values => RepositoryFlagCategory.Values,
        _ => throw new ArgumentOutOfRangeException(nameof(category), category, "unknown flag category")
    };

    private static DateTimeOffset ToDateTimeOffsetUtc(DateTime value) =>
        value.Kind switch
        {
            DateTimeKind.Utc => new DateTimeOffset(value),
            DateTimeKind.Local => value.ToUniversalTime(),
            _ => new DateTimeOffset(DateTime.SpecifyKind(value, DateTimeKind.Utc))
        };
}
