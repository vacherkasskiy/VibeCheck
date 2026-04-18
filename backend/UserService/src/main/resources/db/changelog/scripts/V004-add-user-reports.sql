CREATE TABLE IF NOT EXISTS user_reports (
    report_id VARCHAR(255) PRIMARY KEY,
    version INTEGER,
    source VARCHAR(32) NOT NULL,
    target_user_id UUID NOT NULL,
    reporter_user_id UUID NOT NULL,
    review_id VARCHAR(255),
    reason_type VARCHAR(64) NOT NULL,
    reason_text VARCHAR(1000),
    status VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    external_event_id VARCHAR(255),

    CONSTRAINT fk_user_reports_target_user
        FOREIGN KEY (target_user_id) REFERENCES users(id),
    CONSTRAINT fk_user_reports_reporter_user
        FOREIGN KEY (reporter_user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_user_reports_created_at ON user_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_reports_target_user_id ON user_reports(target_user_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reporter_user_id ON user_reports(reporter_user_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_user_reports_external_event_id ON user_reports(external_event_id) WHERE external_event_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS processed_report_events (
    event_id VARCHAR(255) PRIMARY KEY,
    report_id VARCHAR(255) NOT NULL,
    processed_at TIMESTAMPTZ NOT NULL
);
