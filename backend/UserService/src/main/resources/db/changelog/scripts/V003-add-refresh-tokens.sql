CREATE TABLE IF NOT EXISTS refresh_tokens (
                                token_id VARCHAR(64) PRIMARY KEY,
                                version int,
                                user_id UUID NOT NULL,
                                token_hash VARCHAR(255) NOT NULL,
                                issued_at TIMESTAMP NOT NULL,
                                expires_at TIMESTAMP NOT NULL,
                                revoked_at TIMESTAMP,
                                created_at TIMESTAMP NOT NULL,

                                CONSTRAINT fk_refresh_tokens_user
                                    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);