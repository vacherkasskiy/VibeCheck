using System.ComponentModel.DataAnnotations;

namespace ReviewService.Core.Abstractions.Models.Flags;

public sealed record SetUserFlagsOperationModel
{
    [Required] public IReadOnlyCollection<SetUserFlagGroupOperationModel> GreenFlags { get; set; } = [];

    [Required] public IReadOnlyCollection<SetUserFlagGroupOperationModel> RedFlags { get; set; } = [];
}

public sealed record SetUserFlagGroupOperationModel
{
    [Range(1, 3)]
    public int Weight { get; set; }

    [Required] [MinLength(1)] public IReadOnlyCollection<Guid> Flags { get; set; } = [];
}