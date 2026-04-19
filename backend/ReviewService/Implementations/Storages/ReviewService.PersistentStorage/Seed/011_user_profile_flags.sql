insert into user_profile_flags
    (user_id, flag_id, color, priority, weight, created_at)
values
    -- anton_s
    ('4d3f9d74-c4cb-4e6f-8d31-4ef4c2eaa101', '9d4b6f4a-4d9f-4cd0-a64e-cb0a09aa7c09', 'Green', 1, 3, now()), -- доверяют
    ('4d3f9d74-c4cb-4e6f-8d31-4ef4c2eaa101', '0b3a2f58-e36d-4167-a4b2-f7f0f6bbd617', 'Green', 2, 3,
     now()),                                                                                                -- дают пробовать
    ('4d3f9d74-c4cb-4e6f-8d31-4ef4c2eaa101', '4e1e9f57-1570-4921-b52b-01d4743a9463', 'Green', 3, 2,
     now()),                                                                                                -- помогают развиваться
    ('4d3f9d74-c4cb-4e6f-8d31-4ef4c2eaa101', '2c99ec96-31c4-4aa1-8d53-f0670e197a19', 'Red', 4, 3,
     now()),                                                                                                -- сильное давление
    ('4d3f9d74-c4cb-4e6f-8d31-4ef4c2eaa101', 'dbbb1b7b-2729-4148-94fb-4d78c4b20529', 'Red', 5, 2,
     now()),                                                                                                -- горят дедлайны

    -- lena_dev
    ('af7f7d50-30f8-4d72-a55d-f5fa4a728102', 'bc75a77c-30f1-415d-a310-f3a8d2ec3d25', 'Green', 1, 3, now()), -- креативят
    ('af7f7d50-30f8-4d72-a55d-f5fa4a728102', '5b53b0f8-1a57-4865-b1f0-f5f9cc32b133', 'Green', 2, 2,
     now()),                                                                                                -- можно говорить открыто
    ('af7f7d50-30f8-4d72-a55d-f5fa4a728102', '7a4d4103-6ea4-41cf-93af-0dbf19f7d445', 'Green', 3, 2,
     now()),                                                                                                -- идут в ногу со временем
    ('af7f7d50-30f8-4d72-a55d-f5fa4a728102', 'f55a7bfe-8d22-4fb1-a2d9-b4937d87fd26', 'Red', 4, 2,
     now()),                                                                                                -- скучные задачи
    ('af7f7d50-30f8-4d72-a55d-f5fa4a728102', '80ff80de-fbf1-490f-931e-c5d3dd3b0f40', 'Red', 5, 1,
     now()),                                                                                                -- закрытые разговоры

    -- igor_backend
    ('69b7f1de-3a0d-43bd-a6ef-3ecbfe6b7103', '3656bda5-f63f-4a18-b325-b44b2f38cb21', 'Green', 1, 3, now()), -- всё чётко
    ('69b7f1de-3a0d-43bd-a6ef-3ecbfe6b7103', '267a5b64-f3db-4378-b9f1-146db6ccf130', 'Green', 2, 2,
     now()),                                                                                                -- расставляют приоритеты
    ('69b7f1de-3a0d-43bd-a6ef-3ecbfe6b7103', 'd729b145-0a4b-4be6-b76e-20e3ca1b7b65', 'Green', 3, 2,
     now()),                                                                                                -- понятные цели
    ('69b7f1de-3a0d-43bd-a6ef-3ecbfe6b7103', '2a65d6c9-f813-42df-8076-b42f7abed112', 'Red', 4, 3,
     now()),                                                                                                -- полный бардак
    ('69b7f1de-3a0d-43bd-a6ef-3ecbfe6b7103', 'cd26b450-7fb5-4f49-926b-f8e95765ea72', 'Red', 5, 2, now()),   -- переработки

    -- maria_pm
    ('4b84d5b3-c1cc-4322-bca0-d11e0b52d104', '2e9b52df-8a86-49a7-9d47-c2b7f31b4136', 'Green', 1, 3,
     now()),                                                                                                -- вместе решают
    ('4b84d5b3-c1cc-4322-bca0-d11e0b52d104', '2f43b7b0-c7fb-4a8a-a247-228a23706e27', 'Green', 2, 3,
     now()),                                                                                                -- думают наперёд
    ('4b84d5b3-c1cc-4322-bca0-d11e0b52d104', '854e2c85-f7f6-4e5d-b83f-7c7edec04d20', 'Green', 3, 2,
     now()),                                                                                                -- уважают людей
    ('4b84d5b3-c1cc-4322-bca0-d11e0b52d104', 'dbbb1b7b-2729-4148-94fb-4d78c4b20529', 'Red', 4, 3,
     now()),                                                                                                -- горят дедлайны
    ('4b84d5b3-c1cc-4322-bca0-d11e0b52d104', '2a65d6c9-f813-42df-8076-b42f7abed112', 'Red', 5, 2,
     now()),                                                                                                -- полный бардак

    -- denis_data
    ('e8d44aa8-59f8-47f8-90b8-8e367191c105', '2f43b7b0-c7fb-4a8a-a247-228a23706e27', 'Green', 1, 3,
     now()),                                                                                                -- думают наперёд
    ('e8d44aa8-59f8-47f8-90b8-8e367191c105', '3773b3cf-a570-4297-a5d3-a0a874efca54', 'Green', 2, 2,
     now()),                                                                                                -- бонусы за результат
    ('e8d44aa8-59f8-47f8-90b8-8e367191c105', '11a5fcda-a1fd-42a2-a7eb-5d591757b285', 'Green', 3, 2,
     now()),                                                                                                -- современное оборудование
    ('e8d44aa8-59f8-47f8-90b8-8e367191c105', 'e91d8f64-a3f0-4d28-8c42-0a11a95d4622', 'Red', 4, 2,
     now()),                                                                                                -- вечные задержки
    ('e8d44aa8-59f8-47f8-90b8-8e367191c105', '40ce96d2-8a75-480b-a578-fd0a4f219657', 'Red', 5, 3, now()),   -- серая схема

    -- kate_hr
    ('b2d5d983-1f53-4e0e-b8f4-f3c016350106', '854e2c85-f7f6-4e5d-b83f-7c7edec04d20', 'Green', 1, 3,
     now()),                                                                                                -- уважают людей
    ('b2d5d983-1f53-4e0e-b8f4-f3c016350106', 'b49d4056-b30a-4941-be50-83bf4a07ff89', 'Green', 2, 3,
     now()),                                                                                                -- заботятся о сотрудниках
    ('b2d5d983-1f53-4e0e-b8f4-f3c016350106', '8df6c0d9-ff3d-4f84-b6b6-8b7d72659f31', 'Green', 3, 2,
     now()),                                                                                                -- командный дух
    ('b2d5d983-1f53-4e0e-b8f4-f3c016350106', 'c84b85d4-2c55-4b6e-ba7a-c29f919c8167', 'Red', 4, 2,
     now()),                                                                                                -- частая смена кадров
    ('b2d5d983-1f53-4e0e-b8f4-f3c016350106', '59f6ac8f-bb85-4dd5-b0e2-b1b3a9997788', 'Red', 5, 3,
     now()),                                                                                                -- только про прибыль

    -- nikita_go
    ('87cc4d53-2b39-4428-89d8-24e1d3f3e107', '76a27d9b-09c0-4fa1-ac4b-2589815da423', 'Green', 1, 3,
     now()),                                                                                                -- двигаются быстро
    ('87cc4d53-2b39-4428-89d8-24e1d3f3e107', '9d4b6f4a-4d9f-4cd0-a64e-cb0a09aa7c09', 'Green', 2, 3, now()), -- доверяют
    ('87cc4d53-2b39-4428-89d8-24e1d3f3e107', '49506faa-372e-4448-a1fe-3c2f1d2c1269', 'Green', 3, 2,
     now()),                                                                                                -- ставят задачи на вырост
    ('87cc4d53-2b39-4428-89d8-24e1d3f3e107', '2c99ec96-31c4-4aa1-8d53-f0670e197a19', 'Red', 4, 2,
     now()),                                                                                                -- сильное давление
    ('87cc4d53-2b39-4428-89d8-24e1d3f3e107', '6215f3a5-d04f-40ae-b2a1-4ef410ec9d77', 'Red', 5, 3, now()),   -- 24/7 режим

    -- olga_qa
    ('6380aa08-a1f6-4ee5-9d3b-4f06e7fb8108', '7d5d1de2-34d0-4b9d-9ad8-89dd7e366c24', 'Green', 1, 3,
     now()),                                                                                                -- следят за качеством
    ('6380aa08-a1f6-4ee5-9d3b-4f06e7fb8108', '1f707dc7-4775-4560-9b9f-b9a760bb9e34', 'Green', 2, 2,
     now()),                                                                                                -- дают фидбэк
    ('6380aa08-a1f6-4ee5-9d3b-4f06e7fb8108', '2cb8d756-6a3c-4f52-922a-4cad6d4e5339', 'Green', 3, 2,
     now()),                                                                                                -- всё понятно
    ('6380aa08-a1f6-4ee5-9d3b-4f06e7fb8108', 'e91d8f64-a3f0-4d28-8c42-0a11a95d4622', 'Red', 4, 2,
     now()),                                                                                                -- вечные задержки
    ('6380aa08-a1f6-4ee5-9d3b-4f06e7fb8108', 'd95065ea-84dc-482e-a5e8-1dcf4ff1c686', 'Red', 5, 2,
     now()),                                                                                                -- проблемы с техникой

    -- roman_arch
    ('5b0df38f-8bba-40d7-a593-ecc4bd1e8109', '2f43b7b0-c7fb-4a8a-a247-228a23706e27', 'Green', 1, 3,
     now()),                                                                                                -- думают наперёд
    ('5b0df38f-8bba-40d7-a593-ecc4bd1e8109', 'a3d83542-3cc0-4f33-b18f-42c6faec6c11', 'Green', 2, 3,
     now()),                                                                                                -- честное руководство
    ('5b0df38f-8bba-40d7-a593-ecc4bd1e8109', '6531ee58-32a2-49ea-a5ab-e1840c110168', 'Green', 3, 2,
     now()),                                                                                                -- сильная команда
    ('5b0df38f-8bba-40d7-a593-ecc4bd1e8109', '2a65d6c9-f813-42df-8076-b42f7abed112', 'Red', 4, 3,
     now()),                                                                                                -- полный бардак
    ('5b0df38f-8bba-40d7-a593-ecc4bd1e8109', '0cfe4aa4-94cc-4824-b16e-8adfc6d81590', 'Red', 5, 2,
     now()),                                                                                                -- двойные стандарты

    -- sonya_ui
    ('a4f9a730-6a71-41cb-97a1-365a4f4b6110', 'bc75a77c-30f1-415d-a310-f3a8d2ec3d25', 'Green', 1, 3, now()), -- креативят
    ('a4f9a730-6a71-41cb-97a1-365a4f4b6110', '09c6af1a-f532-43b9-b271-342c122a7679', 'Green', 2, 2,
     now()),                                                                                                -- крутой офис
    ('a4f9a730-6a71-41cb-97a1-365a4f4b6110', '1e8139f5-5be7-49d8-aaf9-58a56fd17f08', 'Green', 3, 2,
     now()),                                                                                                -- можно быть собой
    ('a4f9a730-6a71-41cb-97a1-365a4f4b6110', 'a3c0a2a8-8ce0-4e6f-b5ae-b46017930482', 'Red', 4, 2,
     now()),                                                                                                -- шумно и тесно
    ('a4f9a730-6a71-41cb-97a1-365a4f4b6110', 'f33a86fc-bb4c-4730-9ad2-b6deec89f932', 'Red', 5, 1,
     now())                                                                                                 -- интриги за спиной
    on conflict (user_id, flag_id) do
update
    set color = excluded.color,
    priority = excluded.priority,
    weight = excluded.weight,
    created_at = excluded.created_at;