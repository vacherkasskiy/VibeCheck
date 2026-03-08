insert into company_requests
(id, requester_user_id, name, icon_id, site_url, status, created_at, decided_at, decided_by_user_id)
values ('ec0e853e-5d43-4c3c-b42e-9d72577f2101', '4d3f9d74-c4cb-4e6f-8d31-4ef4c2eaa101', 'JetBrains', null,
        'https://www.jetbrains.com', 'approved', now() - interval '20 days', now() - interval '18 days',
        '4b84d5b3-c1cc-4322-bca0-d11e0b52d104'),
       ('5cc2c1d1-bfc8-4406-abfa-826e32b52102', 'af7f7d50-30f8-4d72-a55d-f5fa4a728102', 'Positive Technologies', null,
        'https://www.ptsecurity.com', 'pending', now() - interval '7 days', null, null),
       ('e1f6706a-9f46-4a8e-9228-f3c98fe5c103', '69b7f1de-3a0d-43bd-a6ef-3ecbfe6b7103', 'Raiffeisen Tech', null,
        'https://www.raiffeisen.ru', 'rejected', now() - interval '12 days', now() - interval '9 days',
        '4b84d5b3-c1cc-4322-bca0-d11e0b52d104'),
       ('40c7f3f4-52a8-412e-b416-8f73e4479104', '87cc4d53-2b39-4428-89d8-24e1d3f3e107', 'Miro', null,
        'https://miro.com', 'pending', now() - interval '3 days', null, null) on conflict (id) do
update
    set requester_user_id = excluded.requester_user_id,
    name = excluded.name,
    icon_id = excluded.icon_id,
    site_url = excluded.site_url,
    status = excluded.status,
    created_at = excluded.created_at,
    decided_at = excluded.decided_at,
    decided_by_user_id = excluded.decided_by_user_id;