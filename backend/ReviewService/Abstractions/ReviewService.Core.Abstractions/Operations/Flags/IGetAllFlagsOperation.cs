using ReviewService.Core.Abstractions.Models.Flags;
using ReviewService.Core.Abstractions.Models.Shared;

namespace ReviewService.Core.Abstractions.Operations.Flags;

public interface IGetAllFlagsOperation
{
    Task<Result<GetAllFlagsOperationResultModel>> GetAsync(CancellationToken ct);
}