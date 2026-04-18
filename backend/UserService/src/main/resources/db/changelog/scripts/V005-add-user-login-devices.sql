CREATE TABLE IF NOT EXISTS user_login_devices (
    user_id UUID NOT NULL,
    fingerprint VARCHAR(64) NOT NULL,
    user_agent VARCHAR(1024) NOT NULL,
    ip_address VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT pk_user_login_devices PRIMARY KEY (user_id, fingerprint),
    CONSTRAINT fk_user_login_devices_user
        FOREIGN KEY (user_id) REFERENCES users(id)
);
