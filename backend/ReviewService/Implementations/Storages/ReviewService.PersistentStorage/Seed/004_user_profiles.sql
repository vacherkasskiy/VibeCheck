insert into icons (id, bucket, object_key, content_type, etag, size_bytes, created_at)
values ('usr_ava_anton', 'user-icons', 'anton.png', 'image/png', 'etag_usr_anton', 84211, now()),
       ('usr_ava_lena', 'user-icons', 'lena.png', 'image/png', 'etag_usr_lena', 79204, now()),
       ('usr_ava_igor', 'user-icons', 'igor.png', 'image/png', 'etag_usr_igor', 80142, now()),
       ('usr_ava_maria', 'user-icons', 'maria.png', 'image/png', 'etag_usr_maria', 82317, now()),
       ('usr_ava_denis', 'user-icons', 'denis.png', 'image/png', 'etag_usr_denis', 81590, now()),
       ('usr_ava_kate', 'user-icons', 'kate.png', 'image/png', 'etag_usr_kate', 78620, now()),
       ('usr_ava_nikita', 'user-icons', 'nikita.png', 'image/png', 'etag_usr_nikita', 80431, now()),
       ('usr_ava_olga', 'user-icons', 'olga.png', 'image/png', 'etag_usr_olga', 79773, now()),
       ('usr_ava_roman', 'user-icons', 'roman.png', 'image/png', 'etag_usr_roman', 81024, now()),
       ('usr_ava_sonya', 'user-icons', 'sonya.png', 'image/png', 'etag_usr_sonya', 78851,
        now()) on conflict (id) do nothing;

insert into user_profiles (user_id, icon_id, display_name, updated_at)
values ('4d3f9d74-c4cb-4e6f-8d31-4ef4c2eaa101', 'usr_ava_anton', 'anton_s', now()),
       ('af7f7d50-30f8-4d72-a55d-f5fa4a728102', 'usr_ava_lena', 'lena_dev', now()),
       ('69b7f1de-3a0d-43bd-a6ef-3ecbfe6b7103', 'usr_ava_igor', 'igor_backend', now()),
       ('4b84d5b3-c1cc-4322-bca0-d11e0b52d104', 'usr_ava_maria', 'maria_pm', now()),
       ('e8d44aa8-59f8-47f8-90b8-8e367191c105', 'usr_ava_denis', 'denis_data', now()),
       ('b2d5d983-1f53-4e0e-b8f4-f3c016350106', 'usr_ava_kate', 'kate_hr', now()),
       ('87cc4d53-2b39-4428-89d8-24e1d3f3e107', 'usr_ava_nikita', 'nikita_go', now()),
       ('6380aa08-a1f6-4ee5-9d3b-4f06e7fb8108', 'usr_ava_olga', 'olga_qa', now()),
       ('5b0df38f-8bba-40d7-a593-ecc4bd1e8109', 'usr_ava_roman', 'roman_arch', now()),
       ('a4f9a730-6a71-41cb-97a1-365a4f4b6110', 'usr_ava_sonya', 'sonya_ui', now()) on conflict (user_id) do
update
    set icon_id = excluded.icon_id,
    display_name = excluded.display_name,
    updated_at = excluded.updated_at;