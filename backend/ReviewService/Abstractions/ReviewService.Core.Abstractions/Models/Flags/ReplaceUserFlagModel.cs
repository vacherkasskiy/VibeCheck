namespace ReviewService.Core.Abstractions.Models.Flags;

public sealed record ReplaceUserFlagOperationModel
{
    public Guid FlagId { get; set; }
    public UserFlagColorOperationEnum Color { get; set; }
    public int Weight { get; set; }
}

public enum UserFlagColorOperationEnum
{
    Green = 1,
    Red = 2
}