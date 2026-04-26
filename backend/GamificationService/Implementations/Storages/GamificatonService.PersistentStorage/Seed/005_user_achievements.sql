insert into user_achievements (user_id, achievement_id, progress_current, obtained_at, created_at, updated_at)
values
-- user 1
('4d3f9d74-c4cb-4e6f-8d31-4ef4c2eaa101', '11111111-1111-1111-1111-111111111101',
 1, now() - interval '30 days', now() - interval '30 days', now()),

('4d3f9d74-c4cb-4e6f-8d31-4ef4c2eaa101', '11111111-1111-1111-1111-111111111102',
 1, now() - interval '10 days', now() - interval '10 days', now()),

('4d3f9d74-c4cb-4e6f-8d31-4ef4c2eaa101', '11111111-1111-1111-1111-111111111104',
 4, null, now() - interval '9 days', now()),

-- user 3
('69b7f1de-3a0d-43bd-a6ef-3ecbfe6b7103', '11111111-1111-1111-1111-111111111106',
 1, now() - interval '2 days', now() - interval '2 days', now()),

('69b7f1de-3a0d-43bd-a6ef-3ecbfe6b7103', '11111111-1111-1111-1111-111111111108',
 22, null, now() - interval '5 days', now()),

('69b7f1de-3a0d-43bd-a6ef-3ecbfe6b7103', '11111111-1111-1111-1111-111111111113',
 1, now() - interval '1 days', now() - interval '1 days', now()),

-- user 5
('e8d44aa8-59f8-47f8-90b8-8e367191c105', '11111111-1111-1111-1111-111111111110',
 10, now() - interval '7 days', now() - interval '12 days', now()),

('e8d44aa8-59f8-47f8-90b8-8e367191c105', '11111111-1111-1111-1111-111111111111',
 63, null, now() - interval '12 days', now()),

('e8d44aa8-59f8-47f8-90b8-8e367191c105', '11111111-1111-1111-1111-111111111116',
 1, now() - interval '3 days', now() - interval '3 days', now()) on conflict (user_id, achievement_id) do nothing;