CREATE INDEX IF NOT EXISTS idx_subscriptions_subscriber_author
    ON subscriptions (subscriber_id, author_id);

CREATE INDEX IF NOT EXISTS idx_user_activity_user_created_id
    ON user_activity (user_id, created_at DESC, id DESC);
