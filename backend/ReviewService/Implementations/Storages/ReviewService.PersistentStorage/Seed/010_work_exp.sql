insert into user_work_experience
    (id, user_id, specialization, started_at, finished_at)
values
-- anton_s (Backend)
('a1111111-1111-1111-1111-111111111111', '4d3f9d74-c4cb-4e6f-8d31-4ef4c2eaa101', 'Backend',
 now() - interval '4 years', now() - interval '2 years'),
('a1111111-1111-1111-1111-111111111112', '4d3f9d74-c4cb-4e6f-8d31-4ef4c2eaa101', 'Backend',
 now() - interval '2 years', null),

-- lena_dev (Frontend)
('a2222222-2222-2222-2222-222222222221', 'af7f7d50-30f8-4d72-a55d-f5fa4a728102', 'Frontend',
 now() - interval '5 years', now() - interval '1 year'),
('a2222222-2222-2222-2222-222222222222', 'af7f7d50-30f8-4d72-a55d-f5fa4a728102', 'Frontend',
 now() - interval '1 year', null),

-- igor_backend (Backend)
('a3333333-3333-3333-3333-333333333331', '69b7f1de-3a0d-43bd-a6ef-3ecbfe6b7103', 'Backend',
 now() - interval '3 years', null),

-- maria_pm (PM)
('a4444444-4444-4444-4444-444444444441', '4b84d5b3-c1cc-4322-bca0-d11e0b52d104', 'PM',
 now() - interval '6 years', now() - interval '3 years'),
('a4444444-4444-4444-4444-444444444442', '4b84d5b3-c1cc-4322-bca0-d11e0b52d104', 'PM',
 now() - interval '3 years', null),

-- denis_data (Data)
('a5555555-5555-5555-5555-555555555551', 'e8d44aa8-59f8-47f8-90b8-8e367191c105', 'Data',
 now() - interval '4 years', now() - interval '2 years'),
('a5555555-5555-5555-5555-555555555552', 'e8d44aa8-59f8-47f8-90b8-8e367191c105', 'Data',
 now() - interval '2 years', null),

-- kate_hr (Design в твоём enum, но ник "hr" — пусть будет Design, чтобы не ломать enum)
('a6666666-6666-6666-6666-666666666661', 'b2d5d983-1f53-4e0e-b8f4-f3c016350106', 'Design',
 now() - interval '3 years', null),

-- nikita_go (Backend)
('a7777777-7777-7777-7777-777777777771', '87cc4d53-2b39-4428-89d8-24e1d3f3e107', 'Backend',
 now() - interval '2 years', now() - interval '8 months'),
('a7777777-7777-7777-7777-777777777772', '87cc4d53-2b39-4428-89d8-24e1d3f3e107', 'Backend',
 now() - interval '8 months', null),

-- olga_qa (QA)
('a8888888-8888-8888-8888-888888888881', '6380aa08-a1f6-4ee5-9d3b-4f06e7fb8108', 'QA',
 now() - interval '4 years', null),

-- roman_arch (DevOps)
('a9999999-9999-9999-9999-999999999991', '5b0df38f-8bba-40d7-a593-ecc4bd1e8109', 'DevOps',
 now() - interval '7 years', now() - interval '2 years'),
('a9999999-9999-9999-9999-999999999992', '5b0df38f-8bba-40d7-a593-ecc4bd1e8109', 'DevOps',
 now() - interval '2 years', null),

-- sonya_ui (Design)
('b1111111-1111-1111-1111-111111111111', 'a4f9a730-6a71-41cb-97a1-365a4f4b6110', 'Design',
 now() - interval '2 years', null) on conflict (id) do
update
    set user_id = excluded.user_id,
    specialization = excluded.specialization,
    started_at = excluded.started_at,
    finished_at = excluded.finished_at;