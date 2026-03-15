insert into level_thresholds (level, xp_required_total)
values
    (1, 0),
    (2, 100),
    (3, 250),
    (4, 450),
    (5, 700),
    (6, 1000),
    (7, 1350),
    (8, 1750),
    (9, 2200),
    (10, 2700),
    (11, 3250),
    (12, 3850),
    (13, 4500),
    (14, 5200),
    (15, 5950),
    (16, 6750),
    (17, 7600),
    (18, 8500),
    (19, 9450),
    (20, 10450)
    on conflict (level) do update
                               set xp_required_total = excluded.xp_required_total;