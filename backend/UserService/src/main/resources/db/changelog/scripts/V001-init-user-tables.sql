create table if not exists avatars (
                                       id varchar(255) primary key,
                                       version integer,
                                       url varchar(1024) not null,
                                       created_at timestamptz not null,
                                       updated_at timestamptz not null
);

create table if not exists users (
                                     id uuid primary key,
                                     version integer,
                                     email varchar(255) not null unique,
                                     password varchar(255) not null,
                                     roles jsonb not null,
                                     is_banned boolean not null,
                                     created_at timestamptz not null,
                                     updated_at timestamptz not null
);

create table if not exists user_profile (
                                            user_id uuid primary key,
                                            version integer,
                                            name varchar(255) not null,
                                            sex varchar(50) not null,
                                            avatar_id VARCHAR(255) not null,
                                            birthday timestamptz not null,
                                            education varchar(100) not null,
                                            speciality varchar(100) not null,
                                            work_experience jsonb not null,
                                            created_at timestamptz not null,
                                            updated_at timestamptz not null
);

create table if not exists onboarding_step (
                                            id varchar(255) primary key,
                                            next_step_id varchar(255)
);

create table if not exists user_onboarding_step (
                                            id bigserial primary key,
                                            version integer,
                                            user_id uuid not null,
                                            step_id varchar(255) not null,
                                            status varchar(50) not null,
                                            created_at timestamptz not null,
                                            updated_at timestamptz not null
);

create index ON i_user_onboarding_step_user_id ON user_onboarding_step USING hash(user_id);
