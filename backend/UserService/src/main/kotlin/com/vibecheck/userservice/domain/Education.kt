package com.vibecheck.userservice.domain

enum class Education {
    EDUCATION_LEVEL_NONE,
// Образование отсутствует

    EDUCATION_LEVEL_PRIMARY,
// Начальное общее образование (1–4 класс)

    EDUCATION_LEVEL_BASIC,
// Основное общее образование (9 классов)

    EDUCATION_LEVEL_SECONDARY,
// Среднее общее образование (11 классов, школа)

    EDUCATION_LEVEL_SECONDARY_PROFESSIONAL,
// Среднее профессиональное образование (колледж, техникум)

    EDUCATION_LEVEL_INCOMPLETE_HIGHER,
// Незаконченное высшее образование (обучение не завершено)

    EDUCATION_LEVEL_BACHELOR,
// Высшее образование — бакалавриат

    EDUCATION_LEVEL_SPECIALIST,
// Высшее образование — специалитет

    EDUCATION_LEVEL_MASTER,
// Высшее образование — магистратура

    EDUCATION_LEVEL_POSTGRADUATE,
// Послевузовское образование — аспирантура (кандидат наук)

    EDUCATION_LEVEL_DOCTORATE,
// Послевузовское образование — докторантура (доктор наук)

    EDUCATION_LEVEL_RESIDENCY,
// Ординатура (медицинское и фармацевтическое образование)

    EDUCATION_LEVEL_ADJUNCTURE
// Адъюнктура (военное и силовое послевузовское образование)
}