CREATE TABLE subscriptions (
                               author_id     UUID NOT NULL,
                               subscriber_id UUID NOT NULL,
                               created_at    TIMESTAMPTZ NOT NULL,

                               PRIMARY KEY (author_id, subscriber_id)
);


CREATE TABLE user_activity (
                               id            UUID PRIMARY KEY,
                               user_id       UUID,
                               activity_info JSONB NOT NULL,
                               created_at    TIMESTAMPTZ,
                               expired_at    TIMESTAMPTZ
);

CREATE TABLE user_profile (
                              user_id   UUID PRIMARY KEY,
                              version   INTEGER,
                              name      TEXT,
                              avatar_id TEXT,
                              sex       TEXT,
                              birthday  TIMESTAMPTZ
);