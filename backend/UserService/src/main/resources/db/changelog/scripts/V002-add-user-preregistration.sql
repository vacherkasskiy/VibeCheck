CREATE TABLE IF NOT EXISTS user_preregistration (
    confirm_code integer primary key,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    expired_at TIMESTAMPTZ NOT NULL
);