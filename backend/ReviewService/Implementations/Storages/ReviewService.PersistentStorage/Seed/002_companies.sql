-- icons: id = uuid
insert into icons (id, bucket, object_key, content_type, etag, size_bytes, created_at)
values ('11111111-1111-1111-1111-111111111111', 'company-icons', 'yandex.png', 'image/png', 'etag_yandex', 182431,
        now()),
       ('22222222-2222-2222-2222-222222222222', 'company-icons', 'ozon.png', 'image/png', 'etag_ozon', 173204, now()),
       ('33333333-3333-3333-3333-333333333333', 'company-icons', 'avito.png', 'image/png', 'etag_avito', 167093, now()),
       ('44444444-4444-4444-4444-444444444444', 'company-icons', 'tbank.png', 'image/png', 'etag_tbank', 194522, now()),
       ('55555555-5555-5555-5555-555555555555', 'company-icons', 'sber.png', 'image/png', 'etag_sber', 201441, now()),
       ('66666666-6666-6666-6666-666666666666', 'company-icons', 'alfa.png', 'image/png', 'etag_alfa', 171140, now()),
       ('77777777-7777-7777-7777-777777777777', 'company-icons', 'vk.png', 'image/png', 'etag_vk', 165002, now()),
       ('88888888-8888-8888-8888-888888888888', 'company-icons', 'kaspersky.png', 'image/png', 'etag_kaspersky', 183900,
        now()),
       ('99999999-9999-9999-9999-999999999999', 'company-icons', 'headpoint.png', 'image/png', 'etag_headpoint', 132450,
        now()),
       ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'company-icons', 't1.png', 'image/png', 'etag_t1', 141882, now()),
       ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'company-icons', 'lamoda.png', 'image/png', 'etag_lamoda', 159340,
        now()),
       ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'company-icons', 'wildberries.png', 'image/png', 'etag_wb', 176730,
        now()),
       ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'company-icons', 'hh.png', 'image/png', 'etag_hh', 152100, now()),
       ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'company-icons', 'mts.png', 'image/png', 'etag_mts', 148501, now()),
       ('12121212-1212-1212-1212-121212121212', 'company-icons', '2gis.png', 'image/png', 'etag_2gis', 144777, now()),
       ('13131313-1313-1313-1313-131313131313', 'company-icons', 'kontur.png', 'image/png', 'etag_contour', 149333,
        now()),
       ('14141414-1414-1414-1414-141414141414', 'company-icons', 'x5.png', 'image/png', 'etag_x5', 163801, now()),
       ('15151515-1515-1515-1515-151515151515', 'company-icons', 'rambler.png', 'image/png', 'etag_rambler', 139001,
        now()),
       ('16161616-1616-1616-1616-161616161616', 'company-icons', 'cian.png', 'image/png', 'etag_cian', 145800, now()),
       ('17171717-1717-1717-1717-171717171717', 'company-icons', 'surf.png', 'image/png', 'etag_surf', 136444,
        now()) on conflict (id) do nothing;

-- companies: icon_id = uuid FK -> icons.id
insert into companies
(id, name, description, icon_id, site_url, linkedin_url, hr_url, created_at, updated_at)
values ('14de6f6a-0338-41f2-a7e8-cfbc95c6a401', 'Яндекс',
        'крупная технологическая компания с сильной инженерной культурой и большим количеством направлений.',
        '11111111-1111-1111-1111-111111111111', 'https://ya.ru', 'https://www.linkedin.com/company/yandex',
        'https://hr.yandex.ru', now(), now()),

       ('c307f0b5-5dfa-43d2-b52f-b5a4932f7402', 'Ozon',
        'быстрорастущий маркетплейс с сильным продуктовым и инженерным контуром.',
        '22222222-2222-2222-2222-222222222222', 'https://www.ozon.ru', 'https://www.linkedin.com/company/ozon',
        'https://job.ozon.ru', now(), now()),

       ('de298f64-2bc8-4b16-bda0-445e0d310403', 'Avito',
        'продуктовая компания с сильным фокусом на данные, масштаб и внутренние платформы.',
        '33333333-3333-3333-3333-333333333333', 'https://www.avito.ru', 'https://www.linkedin.com/company/avito',
        'https://career.avito.com', now(), now()),

       ('8795f798-e848-4e91-a271-6c0a41ca9504', 'Т-Банк',
        'финтех с высокой скоростью разработки, зрелыми платформами и сильной инженерной школой.',
        '44444444-4444-4444-4444-444444444444', 'https://www.tbank.ru', 'https://www.linkedin.com/company/t-bank',
        'https://www.tbank.ru/career', now(), now()),

       ('8b5a0b79-7e84-4afa-91c0-fb49a4c0e005', 'Сбер',
        'крупная экосистема с большим числом команд, внутренних продуктов и enterprise-процессов.',
        '55555555-5555-5555-5555-555555555555', 'https://www.sber.ru', 'https://www.linkedin.com/company/sberbank',
        'https://rabota.sber.ru', now(), now()),

       ('cb26b4b0-9123-4e2e-b964-95d7b7ef1606', 'Альфа-Банк',
        'финансовая компания с современными цифровыми сервисами и сильным инженерным брендом.',
        '66666666-6666-6666-6666-666666666666', 'https://alfabank.ru', 'https://www.linkedin.com/company/alfabank',
        'https://job.alfabank.ru', now(), now()),

       ('7548bb56-9dc9-4ca7-b410-00b1ee40d107', 'VK',
        'экосистема продуктов с широким спектром инженерных задач и интенсивной внутренней коммуникацией.',
        '77777777-7777-7777-7777-777777777777', 'https://vk.company', 'https://www.linkedin.com/company/vk',
        'https://team.vk.company', now(), now()),

       ('7f19a40d-53fc-4954-a2b3-e4e1df8bb208', 'Kaspersky',
        'компания в области информационной безопасности с сильным исследовательским и инженерным ядром.',
        '88888888-8888-8888-8888-888888888888', 'https://www.kaspersky.ru',
        'https://www.linkedin.com/company/kaspersky', 'https://careers.kaspersky.com', now(), now()),

       ('54f51221-915f-4ba6-a7b0-3df55c040109', 'Head-Point',
        'разработка backend-продуктов, интеграций и платформенных решений для крупных клиентов.',
        '99999999-9999-9999-9999-999999999999', 'https://head-point.ru', null, null, now(), now()),

       ('e149e3b6-2131-4321-bb6e-e7c5de18d10a', 'Т1',
        'интегратор и крупный разработчик корпоративных решений для enterprise-сегмента.',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'https://t1.ru', null, 'https://career.t1.ru', now(), now()),

       ('26d87f78-28be-4419-b8d8-60ea913f490b', 'Lamoda Tech',
        'e-commerce и fashion-tech с фокусом на продуктовые команды и логистику.',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'https://www.lamoda.ru', 'https://www.linkedin.com/company/lamoda',
        'https://job.lamoda.ru', now(), now()),

       ('d1ab79af-2371-4cdc-a3f8-9c7ee7d0ac0c', 'Wildberries',
        'крупный маркетплейс с высоким темпом роста и большими операционными нагрузками.',
        'cccccccc-cccc-cccc-cccc-cccccccccccc', 'https://www.wildberries.ru', null, null, now(), now()),

       ('f7bfe921-3858-48c4-b80b-eb928dcb960d', 'hh.ru',
        'работа с вакансиями, поиском и данными, зрелые продуктовые процессы.',
        'dddddddd-dddd-dddd-dddd-dddddddddddd', 'https://hh.ru', 'https://www.linkedin.com/company/headhunter',
        'https://career.hh.ru', now(), now()),

       ('72e0ccce-f3cb-45fb-ab4f-ab355d41de0e', 'МТС Digital',
        'телеком и digital-продукты, сочетание enterprise-ландшафта и современных команд.',
        'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'https://mts.ru', 'https://www.linkedin.com/company/mts',
        'https://job.mts.ru', now(), now()),

       ('b98e7702-d6f1-4294-b3d3-74412002b30f', '2ГИС',
        'геосервисы, карты и мобильные продукты с сильной инженерной культурой.',
        '12121212-1212-1212-1212-121212121212', 'https://2gis.ru', 'https://www.linkedin.com/company/2gis',
        'https://career.2gis.ru', now(), now()),

       ('ca49d097-1b64-43a3-8682-f0577d1f0c10', 'Контур',
        'b2b-продукты для бизнеса, сильная школа разработки и качественные процессы.',
        '13131313-1313-1313-1313-131313131313', 'https://kontur.ru', 'https://www.linkedin.com/company/skb-kontur',
        'https://kontur.ru/career', now(), now()),

       ('0f82cbbd-1b02-4f0f-a11f-7d79a5ae0811', 'X5 Tech',
        'ритейл-тех, платформы, логистика и data-нагрузка на большом масштабе.',
        '14141414-1414-1414-1414-141414141414', 'https://www.x5.ru', null, 'https://job.x5.ru', now(), now()),

       ('d6a9f374-bf2d-4973-80f4-593d4f33d212', 'Rambler&Co',
        'медиапродукты и платформы с большим количеством легаси и новых инициатив.',
        '15151515-1515-1515-1515-151515151515', 'https://rambler-co.ru', null, null, now(), now()),

       ('10fd0a80-0f60-4f93-98fe-bd2816ba2813', 'Циан',
        'proptech-продукт с сильным аналитическим контуром и устойчивыми командами.',
        '16161616-1616-1616-1616-161616161616', 'https://www.cian.ru', 'https://www.linkedin.com/company/cian',
        'https://career.cian.tech', now(), now()),

       ('4f735d52-f62e-4504-98f1-1d08dc881d14', 'Surf',
        'продуктовая и аутсорс-разработка, сильная мобильная и командная культура.',
        '17171717-1717-1717-1717-171717171717', 'https://surf.ru', 'https://www.linkedin.com/company/surfstudio',
        'https://career.surf.ru', now(), now()) on conflict (id) do nothing;