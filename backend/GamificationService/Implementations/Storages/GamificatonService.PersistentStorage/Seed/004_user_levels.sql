insert into user_levels (user_id, total_xp, current_level, updated_at)
values ('4d3f9d74-c4cb-4e6f-8d31-4ef4c2eaa101', 120, 2, now()),
       ('af7f7d50-30f8-4d72-a55d-f5fa4a728102', 20, 1, now()),
       ('69b7f1de-3a0d-43bd-a6ef-3ecbfe6b7103', 800, 5, now()),
       ('4b84d5b3-c1cc-4322-bca0-d11e0b52d104', 0, 1, now()),
       ('e8d44aa8-59f8-47f8-90b8-8e367191c105', 1600, 8, now()) on conflict (user_id) do nothing;