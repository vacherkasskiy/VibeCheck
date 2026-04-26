using Prometheus;

namespace ReviewService.Core.Abstractions.Observability;

public static class ReviewMetrics
{
    private static readonly Counter OperationErrorsCounter = Metrics.CreateCounter(
        "review_operation_errors_total",
        "Total number of failed review service operations.",
        new CounterConfiguration
        {
            LabelNames = new[] { "operation", "component", "error_type" }
        });

    private static readonly Histogram OperationDurationHistogram = Metrics.CreateHistogram(
        "review_operation_duration_ms",
        "Duration of review service operations and producers.",
        new HistogramConfiguration
        {
            LabelNames = new[] { "operation", "component", "status" },
            Buckets = Histogram.ExponentialBuckets(start: 1, factor: 2, count: 14)
        });

    private static readonly Counter ProducedMessagesCounter = Metrics.CreateCounter(
        "review_kafka_messages_produced_total",
        "Total number of Kafka messages produced by review service.",
        new CounterConfiguration
        {
            LabelNames = new[] { "producer", "topic", "event_type", "status" }
        });

    private static readonly Counter ReviewsCreatedCounter = Metrics.CreateCounter(
        "review_reviews_created_total",
        "Total number of reviews created.",
        new CounterConfiguration
        {
            LabelNames = new[] { "result" }
        });

    private static readonly Counter ReviewVotesCounter = Metrics.CreateCounter(
        "review_review_votes_total",
        "Total number of review vote actions.",
        new CounterConfiguration
        {
            LabelNames = new[] { "mode", "result" }
        });

    private static readonly Counter ReviewReportsCounter = Metrics.CreateCounter(
        "review_review_reports_total",
        "Total number of review reports created.",
        new CounterConfiguration
        {
            LabelNames = new[] { "reason_type", "result" }
        });

    private static readonly Counter CompanyRequestsCounter = Metrics.CreateCounter(
        "review_company_requests_created_total",
        "Total number of company creation requests created.",
        new CounterConfiguration
        {
            LabelNames = new[] { "result" }
        });

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

    public static void RecordProducedMessage(string producer, string topic, string eventType, string status)
    {
        ProducedMessagesCounter
            .WithLabels(producer, topic, eventType, status)
            .Inc();
    }

    public static void RecordReviewCreated(string result)
    {
        ReviewsCreatedCounter
            .WithLabels(result)
            .Inc();
    }

    public static void RecordVote(string mode, string result)
    {
        ReviewVotesCounter
            .WithLabels(mode, result)
            .Inc();
    }

    public static void RecordReport(string reasonType, string result)
    {
        ReviewReportsCounter
            .WithLabels(reasonType, result)
            .Inc();
    }

    public static void RecordCompanyRequestCreated(string result)
    {
        CompanyRequestsCounter
            .WithLabels(result)
            .Inc();
    }
}
