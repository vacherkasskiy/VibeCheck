using System.ComponentModel.DataAnnotations;

namespace ReviewService.Gateway.DTOs.Flags;

public sealed record SetUserFlagsRequest
{
    [Required] public IReadOnlyCollection<SetUserFlagGroupRequest> GreenFlags { get; set; } = [];

    [Required] public IReadOnlyCollection<SetUserFlagGroupRequest> RedFlags { get; set; } = [];
}

public sealed record SetUserFlagGroupRequest
{
    [Range(1, 3)]
    public int Weight { get; set; }

    [Required] [MinLength(1)] public IReadOnlyCollection<Guid> Flags { get; set; } = [];
}