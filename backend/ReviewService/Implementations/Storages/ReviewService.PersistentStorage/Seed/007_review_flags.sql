with seed(review_id, flag_name, created_at) as (
    values
        ('6b5d7a0e-7d0b-4f7d-a16f-2f3e9b1c0101', 'профи в своём деле', now() - interval '30 days'),
        ('6b5d7a0e-7d0b-4f7d-a16f-2f3e9b1c0101', 'сильная команда', now() - interval '30 days'),

        ('e4c2cf5d-640f-4f23-9f66-3a1e59ab0102', 'всё чётко', now() - interval '22 days'),
        ('e4c2cf5d-640f-4f23-9f66-3a1e59ab0102', 'много бумажек', now() - interval '22 days'),

        ('9f1d0d6f-f4b9-4f11-9a2d-7b3ad8bf0103', 'двигаются быстро', now() - interval '24 days'),
        ('9f1d0d6f-f4b9-4f11-9a2d-7b3ad8bf0103', 'много ответственности', now() - interval '24 days'),
        ('9f1d0d6f-f4b9-4f11-9a2d-7b3ad8bf0103', 'можно расти', now() - interval '24 days'),

        ('4b0c1c9a-2c47-48d7-9e58-08f1f6eb0104', 'сильная команда', now() - interval '14 days'),
        ('4b0c1c9a-2c47-48d7-9e58-08f1f6eb0104', 'переработки', now() - interval '14 days'),

        ('d8509b68-3a46-4377-8f5a-6f47dcb10105', 'дают фидбэк', now() - interval '18 days'),
        ('d8509b68-3a46-4377-8f5a-6f47dcb10105', 'следят за качеством', now() - interval '18 days'),
        ('d8509b68-3a46-4377-8f5a-6f47dcb10105', 'комфортный ритм', now() - interval '18 days'),

        ('1d6e0d2d-71c1-4cd8-82ef-bfef89b70106', 'компания растёт', now() - interval '16 days'),
        ('1d6e0d2d-71c1-4cd8-82ef-bfef89b70106', 'двигаются быстро', now() - interval '16 days'),
        ('1d6e0d2d-71c1-4cd8-82ef-bfef89b70106', 'горят дедлайны', now() - interval '16 days'),

        ('0ce6b1e1-65ea-48ec-a39e-44d58f2e0107', 'дружелюбная команда', now() - interval '21 days'),
        ('0ce6b1e1-65ea-48ec-a39e-44d58f2e0107', 'доверяют', now() - interval '21 days'),

        ('baf9e0c0-4930-4b13-b1e7-8ef5218c0108', 'сильное давление', now() - interval '11 days'),
        ('baf9e0c0-4930-4b13-b1e7-8ef5218c0108', 'горят дедлайны', now() - interval '11 days'),

        ('2a6f4bd8-00ef-49b1-99ba-741de0b00109', 'всё чётко', now() - interval '12 days'),
        ('2a6f4bd8-00ef-49b1-99ba-741de0b00109', 'нормальный график', now() - interval '12 days'),
        ('2a6f4bd8-00ef-49b1-99ba-741de0b00109', 'помогают развиваться', now() - interval '12 days'),

        ('c16d3c74-4f4e-4f4d-8ea8-5c5348a30110', 'креативят', now() - interval '17 days'),
        ('c16d3c74-4f4e-4f4d-8ea8-5c5348a30110', 'можно говорить открыто', now() - interval '17 days')
)
insert into review_flags (review_id, flag_id, created_at)
select
    s.review_id::uuid,
    f.id,
    s.created_at
from seed s
         join flags f on f.name = s.flag_name
    on conflict (review_id, flag_id) do update
                                            set created_at = excluded.created_at;