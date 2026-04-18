namespace GamificatonService.Core.Abstractions.Enums;

public static class AchievementIds
{
    public static readonly Guid FirstReview = Guid.Parse("11111111-1111-1111-1111-111111111102");
    public static readonly Guid TenReviews = Guid.Parse("11111111-1111-1111-1111-111111111104");
    public static readonly Guid FiftyReviews = Guid.Parse("11111111-1111-1111-1111-111111111105");

    public static readonly Guid FirstReactionGiven = Guid.Parse("11111111-1111-1111-1111-111111111106");
    public static readonly Guid TenReactionsGiven = Guid.Parse("11111111-1111-1111-1111-111111111107");
    public static readonly Guid FiftyReactionsGiven = Guid.Parse("11111111-1111-1111-1111-111111111108");
    public static readonly Guid HundredReactionsGiven = Guid.Parse("11111111-1111-1111-1111-111111111109");

    public static readonly Guid TenLikesReceived = Guid.Parse("11111111-1111-1111-1111-111111111110");
    public static readonly Guid HundredLikesReceived = Guid.Parse("11111111-1111-1111-1111-111111111111");
    public static readonly Guid ThousandLikesReceived = Guid.Parse("11111111-1111-1111-1111-111111111112");

    public static readonly Guid FirstSubscriptionMade = Guid.Parse("11111111-1111-1111-1111-11111111110a");
    public static readonly Guid TenSubscriptionsMade = Guid.Parse("11111111-1111-1111-1111-11111111110b");
    public static readonly Guid FiftySubscriptionsMade = Guid.Parse("11111111-1111-1111-1111-11111111110c");

    public static readonly Guid FirstFollowerReceived = Guid.Parse("11111111-1111-1111-1111-111111111113");
    public static readonly Guid TenFollowersReceived = Guid.Parse("11111111-1111-1111-1111-111111111114");
    public static readonly Guid HundredFollowersReceived = Guid.Parse("11111111-1111-1111-1111-111111111115");
}