using ReviewService.Core.Abstractions.Models.Admin.Flags;
using ReviewService.Core.Abstractions.Models.Shared;

namespace ReviewService.Core.Abstractions.Operations.Admin.Flags;

public interface IGetAdminFlagsOperation
{
    Task<Result<AdminFlagsPageOperationModel>> GetAsync(
        GetAdminFlagsOperationModel model,
        CancellationToken ct);
}

public interface IGetAdminFlagOperation
{
    Task<Result<AdminFlagOperationModel>> GetAsync(Guid flagId, CancellationToken ct);
}

public interface ICreateAdminFlagOperation
{
    Task<Result<AdminFlagOperationModel>> CreateAsync(
        CreateAdminFlagOperationModel model,
        CancellationToken ct);
}

public interface IUpdateAdminFlagOperation
{
    Task<Result<AdminFlagOperationModel>> UpdateAsync(
        UpdateAdminFlagOperationModel model,
        CancellationToken ct);
}

public interface IDeleteAdminFlagOperation
{
    Task<Result> DeleteAsync(Guid flagId, CancellationToken ct);
}
