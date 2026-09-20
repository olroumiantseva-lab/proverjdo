# Аналитика proverjdo.ru

Счётчик Яндекс Метрики: `112426595`.

## Основная воронка

Для продуктов с бесплатным preview:

1. `product_cta_click`
2. `*_start` — первое взаимодействие с формой
3. `preview_requested`
4. `preview_ready`
5. `paywall_view`
6. `payment_started` — только после успешного создания заказа и получения Robokassa URL
7. `payment_success` — только после подтверждённого entitlement/result
8. `paid_result_opened`

Продукты:
- `letter` — письмо / претензия, 390 ₽
- `document` — составление документа, 590 ₽
- `explain` — объяснение документа, 290 ₽
- `document_check` — проверка договора, 490 ₽
- `situation` — полный разбор ситуации, 1 490 ₽

## События

### Верх воронки
- `landing_view`
- `product_cta_click`
- `letter_start`
- `document_start`
- `explain_start`
- `situation_start`
- `check_start`
- `check_requested`

### Бесплатный результат
- `preview_requested`
- `preview_ready`
- `scan_started`
- `scan_completed`
- `paywall_view`

### Полный разбор ситуации
- `analysis_requested`
- `analysis_ready_for_payment`
- `analysis_failed`

### Оплата и доступ
- `payment_attempted` — старый контрактный экран; попытка submit
- `payment_started` — заказ создан, есть Robokassa URL
- `payment_failed`
- `payment_cancelled`
- `login_started`
- `payment_success`
- `paid_result_opened`

## Параметры

Во все события автоматически добавляются, если доступны:
- `landing_page`
- `referrer_host`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`

После перехода из SEO/коммерческой страницы в продукт:
- `entry_source_page`
- `entry_target`
- `entry_cta_text`
- `product` / `product_id`

Дополнительные безопасные параметры:
- `scenario` для писем
- `mode`, `kind` для документов
- `goal` для объяснения
- `role`, `focus`, `signed` для проверки договора
- `file_count`, `stage` для полного разбора
- `order_id`, `amount` на платёжных событиях

Запрещено отправлять в Метрику:
- email;
- ФИО;
- телефон;
- текст документа;
- текст ситуации;
- ответы на уточняющие вопросы;
- имена файлов;
- любые реквизиты пользователя или контрагента.

## Воронки для отчётов

### Письмо 390 ₽
`product_cta_click → letter_start → preview_requested → preview_ready → paywall_view → payment_started → payment_success → paid_result_opened`

### Документ 590 ₽
`product_cta_click → document_start → preview_requested → preview_ready → paywall_view → payment_started → payment_success → paid_result_opened`

### Объяснение 290 ₽
`product_cta_click → explain_start → preview_requested → preview_ready → paywall_view → payment_started → payment_success → paid_result_opened`

### Проверка договора 490 ₽
`product_cta_click → check_requested → scan_started → scan_completed/paywall_view → payment_started → payment_success → paid_result_opened`

### Полный разбор 1 490 ₽
`product_cta_click → situation_start → analysis_requested → analysis_ready_for_payment → payment_started → payment_success → paid_result_opened`

## Главные разрезы

1. `entry_source_page` — какая SEO-страница приводит к деньгам.
2. `product` — какой продукт конвертирует.
3. `utm_source / utm_medium / utm_campaign` — платный/внешний трафик.
4. Отвал между каждым соседним шагом.
5. `payment_cancelled` и `payment_failed` — проблемы у paywall/Robokassa.
6. `analysis_failed.stage` — где ломается полный разбор.
