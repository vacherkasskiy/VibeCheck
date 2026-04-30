# VibeCheck

## Запуск

```shell
cd ./infra/deploy
bash script.sh
```

После выполнения команды:
```shell
kubcetl get pod -n vibecheck
```

Тестовый пользователь:
```json
{
  "login": "alex.admin@vibecheck.local",
  "password": "Test123!"
}
```

Вечный токен для gateway:
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhdXRoLXNlcnZpY2UiLCJzdWIiOiI0ZDNmOWQ3NC1jNGNiLTRlNmYtOGQzMS00ZWY0YzJlYWExMDEiLCJhdWQiOlsidXNlci1zZXJ2aWNlIl0sImlhdCI6MTc3NzQ0ODUxNCwiZXhwIjo0MTAyNDQ0ODAwLCJqdGkiOiJhY2NlNTVhYS1hYWFhLTRhYWEtOGFhYS1hYWFhYWFhYWFhYWEiLCJ0eXBlIjoiYWNjZXNzIiwicm9sZXMiOlsiQURNSU4iLCJVU0VSIl0sImlzX2Jhbm5lZCI6ZmFsc2V9.ceEViWlnBCNcN2_DicjM_6e-HHKvkk3Vjt6t5Cxycfg
```

Вечный токен для внутренних сервисов:
```
Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImludGVybmFsLWtleS0yMDI2LTA0In0.eyJpc3MiOiJ1c2VyLXNlcnZpY2UiLCJzdWIiOiI0ZDNmOWQ3NC1jNGNiLTRlNmYtOGQzMS00ZWY0YzJlYWExMDEiLCJhdWQiOlsic3Vic2NyaXB0aW9uLXNlcnZpY2UiLCJyZXZpZXctc2VydmljZSIsImdhbWlmaWNhdGlvbi1zZXJ2aWNlIiwidXNlci1zZXJ2aWNlIl0sImlhdCI6MTc3NzQ0ODUxNCwiZXhwIjo0MTAyNDQ0ODAwLCJqdGkiOiIxbjdlNDRhYS1iYmJiLTRiYmItOGJiYi1iYmJiYmJiYmJiYmIiLCJyb2xlcyI6WyJBRE1JTiIsIlVTRVIiXSwiaXNfYmFubmVkIjpmYWxzZX0.DvT4tGZkdUrKPVFT8H1SgvgAVXzVmk3A0SAHE-7V4aH9PKfsNrWzz_ihZpNiPrmGzNgtMP8XuZXmC6LVHcAwBEP0DB8yYBZzTYQH7UGdnxrb090sktSguDDdrrqG9uRDp9RA672lsJbUrXqiqAnJnQpSCWEp68M6PfwK_EJRwDU_DfJnU00WZkCrK4eoBx1I-6A2ShZZNP548fSLJ4lOYxdBpranMKSo0PASR1N1A1k44zsHS_iHJpGQmHdylD55QXVA-HuW8qxEGiqCqCl8yZL-EE89nE6CyF7WdttwhcSrcaNfJjg79shrTIMHt2jb48lfcSW4T0bZLtuQcuBQIw
```

Дождаться готовности всех подов.

## Аннотация проекта

VibeCheck (рабочее название)— интерактивная платформа для отзывов о работодателях, ориентированная на поколение Z.
В отличие от традиционных сайтов с рейтингами и звёздами, VibeCheck использует систему "вайб"-тегов, отражающих эмоциональную атмосферу компании.
Платформа помогает пользователям узнавать реальную корпоративную культуру "из первых рук", а компаниям — получать честный фидбэк и управлять своим HR-брендом.

### Цель проекта

---

Создать веб-приложение (PWA или Telegram Mini App), которое позволяет пользователям оставлять и просматривать отзывы о работодателях с помощью тегов, а компаниям — анализировать восприятие своей корпоративной культуры.

### Задачи проекта

---

Разработать интерфейс для отзывов и тегирования компаний ("Green/Red flags").
Реализовать систему поиска и фильтрации компаний по тегам и предпочтениям.
Создать личные кабинеты для соискателей и работодателей (с аналитикой и возможностью отвечать на отзывы).
Разработать административные панели для модерации контента и управления тегами.
Обеспечить безопасность  пользователей.
(Опционально) Реализовать элементы геймификации и систему достижений.
(Опционально) Добавить базовую аналитику для компаний (топ-теги, динамика изменений).

### Команда проекта

---

– Фронтенд-разработчик
Отвечает за клиентскую часть (PWA/Telegram Mini App), включая разработку интерфейсов, маршрутизацию, взаимодействие с API и UX-оптимизацию.

– Бэкенд-разработчик
Занимается реализацией core-бэкенда: проектированием базы данных, написанием бизнес-логики, созданием REST API и обеспечением безопасности данных.

– Бэкенд-разработчик / SRE
Отвечает за разработку отдельных микросервисов, настройку инфраструктуры (CI/CD, контейнеризация, деплой), а также обеспечение отказоустойчивости и масштабируемости проекта.

### Планируемый результат

---

Работающее приложение с базовым функционалом для соискателей, компаний и администраторов, включающее:

публикацию и просмотр отзывов с тегами,
поиск по предпочтениям,
систему аналитики и административный интерфейс.

В дальнейшем проект может быть расширен за счёт персонализированных рекомендаций, интеграции с Telegram Mini App и внедрения ИИ-модерации.