insert into public.xp_rules
(id, code, name, description, type, action_key, xp_amount, threshold_value, is_active, is_repeatable, cooldown_days,
 created_at, updated_at)
values
-- action rewards
('22222222-2222-2222-2222-222222222001', 'xp.review.created', 'XP за новый отзыв',
 'Начисляется за написание нового отзыва.', 1, 'review.created', 30, null, true, true, null, now(), now()),
('22222222-2222-2222-2222-222222222002', 'xp.review.updated', 'XP за обновление отзыва',
 'Начисляется за обновление собственного отзыва.', 1, 'review.updated', 15, null, true, true, null, now(), now()),
('22222222-2222-2222-2222-222222222003', 'xp.review.reacted', 'XP за оценку чужого отзыва',
 'Начисляется за лайк или дизлайк чужого отзыва.', 1, 'review.reacted', 2, null, true, true, null, now(), now()),
('22222222-2222-2222-2222-222222222004', 'xp.subscription.created.outgoing', 'XP за подписку на профиль',
 'Начисляется за подписку на профиль другого пользователя.', 1, 'subscription.created.outgoing', 2, null, true, true,
 null, now(), now()),
('22222222-2222-2222-2222-222222222005', 'xp.subscription.paid.first', 'XP за первую платную подписку',
 'Начисляется за первую покупку платной подписки.', 1, 'subscription.paid.first', 150, null, true, false, null, now(),
 now()),
('22222222-2222-2222-2222-222222222006', 'xp.subscription.paid.month.active', 'XP за активную платную подписку',
 'Начисляется за каждый месяц активной платной подписки.', 1, 'subscription.paid.month.active', 20, null, true, true,
 30, now(), now()),
('22222222-2222-2222-2222-222222222007', 'xp.recommendation.flags.changed', 'XP за смену флагов рекомендаций',
 'Начисляется за значимую смену флагов рекомендаций не чаще 1 раза в неделю.', 1, 'recommendation.flags.changed', 10,
 null, true, true, 7, now(), now()),
('22222222-2222-2222-2222-222222222008', 'xp.review.like.received', 'XP за полученный лайк',
 'Начисляется за каждый полученный лайк на отзыв.', 1, 'review.like.received', 3, null, true, true, null, now(), now()),
('22222222-2222-2222-2222-222222222009', 'xp.subscription.created.incoming', 'XP за нового подписчика',
 'Начисляется за каждого нового подписчика на профиль.', 1, 'subscription.created.incoming', 10, null, true, true, null,
 now(), now()),
('22222222-2222-2222-2222-22222222200a', 'xp.company.recommendation.created', 'XP за рекомендацию компании',
 'Начисляется за заполнение формы рекомендации новой компании.', 1, 'company.recommendation.created', 50, null, true,
 false, null, now(), now()),
('22222222-2222-2222-2222-22222222200b', 'xp.platform.feedback.created', 'XP за отзыв о платформе',
 'Начисляется за заполнение формы обратной связи о платформе.', 1, 'platform.feedback.created', 40, null, true, false,
 null, now(), now()),

-- threshold rewards: reviews created
('22222222-2222-2222-2222-222222222101', 'xp.review.created.threshold.1', 'XP за первый отзыв',
 'Начисляется за первый написанный отзыв.', 2, 'review.created', 30, 1, true, false, null, now(), now()),
('22222222-2222-2222-2222-222222222102', 'xp.review.created.threshold.10', 'XP за 10 отзывов',
 'Начисляется за 10 написанных отзывов.', 2, 'review.created', 70, 10, true, false, null, now(), now()),
('22222222-2222-2222-2222-222222222103', 'xp.review.created.threshold.50', 'XP за 50 отзывов',
 'Начисляется за 50 написанных отзывов.', 2, 'review.created', 200, 50, true, false, null, now(), now()),

-- threshold rewards: reviews updated
('22222222-2222-2222-2222-222222222104', 'xp.review.updated.threshold.1', 'XP за первый обновлённый отзыв',
 'Начисляется за первое обновление собственного отзыва.', 2, 'review.updated', 20, 1, true, false, null, now(), now()),

-- threshold rewards: review reactions made
('22222222-2222-2222-2222-222222222105', 'xp.review.reacted.threshold.1', 'XP за первую оценку',
 'Начисляется за первую оценку чужого отзыва.', 2, 'review.reacted', 10, 1, true, false, null, now(), now()),
('22222222-2222-2222-2222-222222222106', 'xp.review.reacted.threshold.10', 'XP за 10 оценок',
 'Начисляется за 10 оценок чужих отзывов.', 2, 'review.reacted', 20, 10, true, false, null, now(), now()),
('22222222-2222-2222-2222-222222222107', 'xp.review.reacted.threshold.50', 'XP за 50 оценок',
 'Начисляется за 50 оценок чужих отзывов.', 2, 'review.reacted', 50, 50, true, false, null, now(), now()),
('22222222-2222-2222-2222-222222222108', 'xp.review.reacted.threshold.100', 'XP за 100 оценок',
 'Начисляется за 100 оценок чужих отзывов.', 2, 'review.reacted', 100, 100, true, false, null, now(), now()),

-- threshold rewards: outgoing subscriptions
('22222222-2222-2222-2222-222222222109', 'xp.subscription.created.outgoing.threshold.1', 'XP за первую подписку',
 'Начисляется за первую подписку на другой профиль.', 2, 'subscription.created.outgoing', 10, 1, true, false, null,
 now(), now()),
('22222222-2222-2222-2222-22222222210a', 'xp.subscription.created.outgoing.threshold.10', 'XP за 10 подписок',
 'Начисляется за 10 исходящих подписок.', 2, 'subscription.created.outgoing', 20, 10, true, false, null, now(), now()),
('22222222-2222-2222-2222-22222222210b', 'xp.subscription.created.outgoing.threshold.50', 'XP за 50 подписок',
 'Начисляется за 50 исходящих подписок.', 2, 'subscription.created.outgoing', 50, 50, true, false, null, now(), now()),

-- threshold rewards: likes received
('22222222-2222-2222-2222-22222222210c', 'xp.review.like.received.threshold.10', 'XP за 10 лайков',
 'Начисляется за первые 10 лайков на отзывы пользователя.', 2, 'review.like.received', 30, 10, true, false, null, now(),
 now()),
('22222222-2222-2222-2222-22222222210d', 'xp.review.like.received.threshold.100', 'XP за 100 лайков',
 'Начисляется за первые 100 лайков на отзывы пользователя.', 2, 'review.like.received', 100, 100, true, false, null,
 now(), now()),
('22222222-2222-2222-2222-22222222210e', 'xp.review.like.received.threshold.1000', 'XP за 1000 лайков',
 'Начисляется за первые 1000 лайков на отзывы пользователя.', 2, 'review.like.received', 300, 1000, true, false, null,
 now(), now()),

-- threshold rewards: incoming subscriptions
('22222222-2222-2222-2222-22222222210f', 'xp.subscription.created.incoming.threshold.1', 'XP за первого подписчика',
 'Начисляется за первого подписчика на профиль.', 2, 'subscription.created.incoming', 20, 1, true, false, null, now(),
 now()),
('22222222-2222-2222-2222-222222222110', 'xp.subscription.created.incoming.threshold.10', 'XP за 10 подписчиков',
 'Начисляется за 10 подписчиков на профиль.', 2, 'subscription.created.incoming', 80, 10, true, false, null, now(),
 now()),
('22222222-2222-2222-2222-222222222111', 'xp.subscription.created.incoming.threshold.100', 'XP за 100 подписчиков',
 'Начисляется за 100 подписчиков на профиль.', 2, 'subscription.created.incoming', 300, 100, true, false, null, now(),
 now()),

-- threshold rewards: paid subscription duration
('22222222-2222-2222-2222-222222222112', 'xp.subscription.paid.month.active.threshold.12', 'XP за год подписки',
 'Начисляется за 12 месяцев непрерывной платной подписки.', 2, 'subscription.paid.month.active', 200, 12, true, false,
 null, now(), now()),

-- threshold rewards: contribution
('22222222-2222-2222-2222-222222222113', 'xp.company.recommendation.created.threshold.1',
 'XP за первую рекомендацию компании', 'Начисляется за первую рекомендацию новой компании.', 2,
 'company.recommendation.created', 50, 1, true, false, null, now(), now()),
('22222222-2222-2222-2222-222222222114', 'xp.platform.feedback.created.threshold.1', 'XP за первый отзыв о платформе',
 'Начисляется за первый отзыв о платформе.', 2, 'platform.feedback.created', 40, 1, true, false, null, now(),
 now()) on conflict (id) do nothing;