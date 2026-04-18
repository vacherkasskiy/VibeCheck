CREATE TABLE IF NOT EXISTS user_confirmation (
    confirm_code integer primary key,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    expired_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);