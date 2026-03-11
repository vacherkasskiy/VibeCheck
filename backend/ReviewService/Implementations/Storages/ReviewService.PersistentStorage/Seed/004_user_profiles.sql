insert into user_profiles
(user_id, icon_id, display_name, birthday, education, specialization, updated_at)
values ('4d3f9d74-c4cb-4e6f-8d31-4ef4c2eaa101', 'usr_ava_anton', 'anton_s', null, 'Bachelor', 'Backend', now()),
       ('af7f7d50-30f8-4d72-a55d-f5fa4a728102', 'usr_ava_lena', 'lena_dev', null, 'Master', 'Frontend', now()),
       ('69b7f1de-3a0d-43bd-a6ef-3ecbfe6b7103', 'usr_ava_igor', 'igor_backend', null, 'Bachelor', 'Backend', now()),
       ('4b84d5b3-c1cc-4322-bca0-d11e0b52d104', 'usr_ava_maria', 'maria_pm', null, 'Bachelor', 'PM', now()),
       ('e8d44aa8-59f8-47f8-90b8-8e367191c105', 'usr_ava_denis', 'denis_data', null, 'Master', 'Data', now()),
       ('b2d5d983-1f53-4e0e-b8f4-f3c016350106', 'usr_ava_kate', 'kate_hr', null, 'Bachelor', 'Design', now()),
       ('87cc4d53-2b39-4428-89d8-24e1d3f3e107', 'usr_ava_nikita', 'nikita_go', null, 'Bachelor', 'Backend', now()),
       ('6380aa08-a1f6-4ee5-9d3b-4f06e7fb8108', 'usr_ava_olga', 'olga_qa', null, 'Bachelor', 'QA', now()),
       ('5b0df38f-8bba-40d7-a593-ecc4bd1e8109', 'usr_ava_roman', 'roman_arch', null, 'Master', 'DevOps', now()),
       ('a4f9a730-6a71-41cb-97a1-365a4f4b6110', 'usr_ava_sonya', 'sonya_ui', null, 'Bachelor', 'Design',
        now()) on conflict (user_id) do
update
    set icon_id = excluded.icon_id,
    display_name = excluded.display_name,
    birthday = excluded.birthday,
    education = excluded.education,
    specialization = excluded.specialization,
    updated_at = excluded.updated_at;