insert into review_votes (review_id, voter_id, mode, created_at, updated_at)
values
-- review 1: 3 like / 1 dislike
('6b5d7a0e-7d0b-4f7d-a16f-2f3e9b1c0101', 'af7f7d50-30f8-4d72-a55d-f5fa4a728102', 'like', now() - interval '29 days',
 now() - interval '29 days'),
('6b5d7a0e-7d0b-4f7d-a16f-2f3e9b1c0101', '69b7f1de-3a0d-43bd-a6ef-3ecbfe6b7103', 'like', now() - interval '29 days',
 now() - interval '29 days'),
('6b5d7a0e-7d0b-4f7d-a16f-2f3e9b1c0101', '4b84d5b3-c1cc-4322-bca0-d11e0b52d104', 'like', now() - interval '28 days',
 now() - interval '28 days'),
('6b5d7a0e-7d0b-4f7d-a16f-2f3e9b1c0101', 'e8d44aa8-59f8-47f8-90b8-8e367191c105', 'dislike', now() - interval '28 days',
 now() - interval '28 days'),

-- review 2: 2 like / 1 dislike
('e4c2cf5d-640f-4f23-9f66-3a1e59ab0102', '69b7f1de-3a0d-43bd-a6ef-3ecbfe6b7103', 'like', now() - interval '21 days',
 now() - interval '21 days'),
('e4c2cf5d-640f-4f23-9f66-3a1e59ab0102', '4b84d5b3-c1cc-4322-bca0-d11e0b52d104', 'like', now() - interval '21 days',
 now() - interval '21 days'),
('e4c2cf5d-640f-4f23-9f66-3a1e59ab0102', '87cc4d53-2b39-4428-89d8-24e1d3f3e107', 'dislike', now() - interval '20 days',
 now() - interval '20 days'),

-- review 3: 4 like / 1 dislike
('9f1d0d6f-f4b9-4f11-9a2d-7b3ad8bf0103', '4d3f9d74-c4cb-4e6f-8d31-4ef4c2eaa101', 'like', now() - interval '23 days',
 now() - interval '23 days'),
('9f1d0d6f-f4b9-4f11-9a2d-7b3ad8bf0103', 'af7f7d50-30f8-4d72-a55d-f5fa4a728102', 'like', now() - interval '23 days',
 now() - interval '23 days'),
('9f1d0d6f-f4b9-4f11-9a2d-7b3ad8bf0103', '6380aa08-a1f6-4ee5-9d3b-4f06e7fb8108', 'like', now() - interval '22 days',
 now() - interval '22 days'),
('9f1d0d6f-f4b9-4f11-9a2d-7b3ad8bf0103', '5b0df38f-8bba-40d7-a593-ecc4bd1e8109', 'like', now() - interval '22 days',
 now() - interval '22 days'),
('9f1d0d6f-f4b9-4f11-9a2d-7b3ad8bf0103', 'a4f9a730-6a71-41cb-97a1-365a4f4b6110', 'dislike', now() - interval '21 days',
 now() - interval '21 days'),

-- review 4: 3 like / 2 dislike
('4b0c1c9a-2c47-48d7-9e58-08f1f6eb0104', '4d3f9d74-c4cb-4e6f-8d31-4ef4c2eaa101', 'like', now() - interval '13 days',
 now() - interval '13 days'),
('4b0c1c9a-2c47-48d7-9e58-08f1f6eb0104', 'af7f7d50-30f8-4d72-a55d-f5fa4a728102', 'like', now() - interval '13 days',
 now() - interval '13 days'),
('4b0c1c9a-2c47-48d7-9e58-08f1f6eb0104', 'e8d44aa8-59f8-47f8-90b8-8e367191c105', 'like', now() - interval '12 days',
 now() - interval '12 days'),
('4b0c1c9a-2c47-48d7-9e58-08f1f6eb0104', 'b2d5d983-1f53-4e0e-b8f4-f3c016350106', 'dislike', now() - interval '12 days',
 now() - interval '12 days'),
('4b0c1c9a-2c47-48d7-9e58-08f1f6eb0104', '6380aa08-a1f6-4ee5-9d3b-4f06e7fb8108', 'dislike', now() - interval '12 days',
 now() - interval '12 days'),

-- review 5: 4 like / 0 dislike
('d8509b68-3a46-4377-8f5a-6f47dcb10105', '4d3f9d74-c4cb-4e6f-8d31-4ef4c2eaa101', 'like', now() - interval '17 days',
 now() - interval '17 days'),
('d8509b68-3a46-4377-8f5a-6f47dcb10105', 'af7f7d50-30f8-4d72-a55d-f5fa4a728102', 'like', now() - interval '17 days',
 now() - interval '17 days'),
('d8509b68-3a46-4377-8f5a-6f47dcb10105', '87cc4d53-2b39-4428-89d8-24e1d3f3e107', 'like', now() - interval '16 days',
 now() - interval '16 days'),
('d8509b68-3a46-4377-8f5a-6f47dcb10105', 'a4f9a730-6a71-41cb-97a1-365a4f4b6110', 'like', now() - interval '16 days',
 now() - interval '16 days'),

-- review 6: 2 like / 1 dislike
('1d6e0d2d-71c1-4cd8-82ef-bfef89b70106', '4d3f9d74-c4cb-4e6f-8d31-4ef4c2eaa101', 'like', now() - interval '15 days',
 now() - interval '15 days'),
('1d6e0d2d-71c1-4cd8-82ef-bfef89b70106', '69b7f1de-3a0d-43bd-a6ef-3ecbfe6b7103', 'like', now() - interval '15 days',
 now() - interval '15 days'),
('1d6e0d2d-71c1-4cd8-82ef-bfef89b70106', '5b0df38f-8bba-40d7-a593-ecc4bd1e8109', 'dislike', now() - interval '14 days',
 now() - interval '14 days'),

-- review 7: 2 like / 0 dislike
('0ce6b1e1-65ea-48ec-a39e-44d58f2e0107', 'af7f7d50-30f8-4d72-a55d-f5fa4a728102', 'like', now() - interval '20 days',
 now() - interval '20 days'),
('0ce6b1e1-65ea-48ec-a39e-44d58f2e0107', '69b7f1de-3a0d-43bd-a6ef-3ecbfe6b7103', 'like', now() - interval '20 days',
 now() - interval '20 days'),

-- review 8: 1 like / 3 dislike
('baf9e0c0-4930-4b13-b1e7-8ef5218c0108', '69b7f1de-3a0d-43bd-a6ef-3ecbfe6b7103', 'like', now() - interval '10 days',
 now() - interval '10 days'),
('baf9e0c0-4930-4b13-b1e7-8ef5218c0108', '4d3f9d74-c4cb-4e6f-8d31-4ef4c2eaa101', 'dislike', now() - interval '10 days',
 now() - interval '10 days'),
('baf9e0c0-4930-4b13-b1e7-8ef5218c0108', 'af7f7d50-30f8-4d72-a55d-f5fa4a728102', 'dislike', now() - interval '9 days',
 now() - interval '9 days'),
('baf9e0c0-4930-4b13-b1e7-8ef5218c0108', 'a4f9a730-6a71-41cb-97a1-365a4f4b6110', 'dislike', now() - interval '9 days',
 now() - interval '9 days'),

-- review 9: 3 like / 0 dislike
('2a6f4bd8-00ef-49b1-99ba-741de0b00109', '4d3f9d74-c4cb-4e6f-8d31-4ef4c2eaa101', 'like', now() - interval '11 days',
 now() - interval '11 days'),
('2a6f4bd8-00ef-49b1-99ba-741de0b00109', '87cc4d53-2b39-4428-89d8-24e1d3f3e107', 'like', now() - interval '11 days',
 now() - interval '11 days'),
('2a6f4bd8-00ef-49b1-99ba-741de0b00109', '6380aa08-a1f6-4ee5-9d3b-4f06e7fb8108', 'like', now() - interval '10 days',
 now() - interval '10 days'),

-- review 10: 2 like / 2 dislike
('c16d3c74-4f4e-4f4d-8ea8-5c5348a30110', '4d3f9d74-c4cb-4e6f-8d31-4ef4c2eaa101', 'like', now() - interval '16 days',
 now() - interval '16 days'),
('c16d3c74-4f4e-4f4d-8ea8-5c5348a30110', 'a4f9a730-6a71-41cb-97a1-365a4f4b6110', 'like', now() - interval '16 days',
 now() - interval '16 days'),
('c16d3c74-4f4e-4f4d-8ea8-5c5348a30110', '69b7f1de-3a0d-43bd-a6ef-3ecbfe6b7103', 'dislike', now() - interval '15 days',
 now() - interval '15 days'),
('c16d3c74-4f4e-4f4d-8ea8-5c5348a30110', '5b0df38f-8bba-40d7-a593-ecc4bd1e8109', 'dislike', now() - interval '15 days',
 now() - interval '15 days') on conflict (review_id, voter_id) do
update
    set mode = excluded.mode,
    created_at = excluded.created_at,
    updated_at = excluded.updated_at;