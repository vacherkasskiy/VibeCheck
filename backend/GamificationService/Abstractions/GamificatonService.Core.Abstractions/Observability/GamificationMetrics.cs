using Prometheus;

namespace GamificatonService.Core.Abstractions.Observability;

public static class GamificationMetrics
{
    private static readonly Counter ConsumerMessagesCounter = Metrics.CreateCounter(
        "gamification_consumer_messages_total",
        "Total number of gamification Kafka messages handled by consumers.",
        new CounterConfiguration
        {
            LabelNames = new[] { "consumer", "topic", "status" }
        });

    private static readonly Histogram OperationDurationHistogram = Metrics.CreateHistogram(
        "gamification_operation_duration_ms",
        "Duration of gamification operations and message handlers.",
        new HistogramConfiguration
        {
            LabelNames = new[] { "operation", "component", "status" },
            Buckets = Histogram.ExponentialBuckets(start: 1, factor: 2, count: 14)
        });

    private static readonly Counter OperationErrorsCounter = Metrics.CreateCounter(
        "gamification_operation_errors_total",
        "Total number of failed gamification operations.",
        new CounterConfiguration
        {
            LabelNames = new[] { "operation", "component", "error_type" }
        });

    private static readonly Counter AchievementsGrantedCounter = Metrics.CreateCounter(
        "gamification_achievements_granted_total",
        "Total number of granted achievements.",
        new CounterConfiguration
        {
            LabelNames = new[] { "achievement" }
        });

    private static readonly Counter XpAwardedCounter = Metrics.CreateCounter(
        "gamification_xp_awarded_total",
        "Total amount of awarded XP.",
        new CounterConfiguration
        {
            LabelNames = new[] { "source", "subject" }
        });

    private static readonly Counter UserLevelUpsCounter = Metrics.CreateCounter(
        "gamification_user_level_ups_total",
        "Total number of user level up events.",
        new CounterConfiguration
        {
            LabelNames = new[] { "source", "subject" }
        });

    public static void RecordConsumerMessage(string consumer, string topic, string status)
    {
        ConsumerMessagesCounter
            .WithLabels(consumer, topic, status)
            .Inc();
    }

    public static void RecordOperationDuration(string operation, string component, string status, double durationMs)
    {
        OperationDurationHistogram
            .WithLabels(operation, component, status)
            .Observe(durationMs);
    }

    public static void RecordOperationError(string operation, string component, string errorType)
    {
        OperationErrorsCounter
            .WithLabels(operation, component, errorType)
            .Inc();
    }

    public static void RecordAchievementGranted(string achievement)
    {
        AchievementsGrantedCounter
            .WithLabels(achievement)
            .Inc();
    }

    public static void RecordXpAwarded(long xpAmount, string source, string subject)
    {
        XpAwardedCounter
            .WithLabels(source, subject)
            .Inc(xpAmount);
    }

    public static void RecordLevelUp(string source, string subject)
    {
        UserLevelUpsCounter
            .WithLabels(source, subject)
            .Inc();
    }
}
