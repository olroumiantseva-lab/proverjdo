# Аналитика proverjdo.ru

Счётчик Яндекс Метрики: `112839320`.

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


## Сохранённые отчёты и сегменты

### 1. SEO → продажи по кластерам
Основа: отчет «Параметры целей» или пользовательский отчет по цели `payment_success`.

Группировки:
1. `entry_source_cluster`
2. `entry_source_page`
3. `product`

Метрики:
- визиты;
- посетители;
- достижения `product_cta_click`;
- достижения `payment_started`;
- достижения `payment_success`;
- достижения `paid_result_opened`.

Задача: видеть, какие SEO-кластеры и страницы реально приводят к оплате.

Значения `entry_source_cluster`:
- `contracts` — договоры, изменения, расторжение, протоколы разногласий;
- `claims` — претензии;
- `refunds` — возвраты денег и предоплаты;
- `business_letters` — деловые письма и запросы;
- `acts` — акты и отказ от подписания;
- `product_landing` — основные продуктовые посадочные;
- `home`;
- `other`.

### 2. SEO → CTA
Цель: `product_cta_click`.

Группировки:
1. `entry_source_cluster`
2. `entry_source_page`
3. `entry_target`
4. `entry_cta_text`
5. `product`

Задача: находить страницы с трафиком, но слабым переходом в продукт, и сравнивать CTA.

### 3. Оплата: старт → успех
Цели:
- `payment_started`;
- `payment_success`;
- `payment_failed`;
- `payment_cancelled`.

Группировки:
1. `product`
2. `entry_source_cluster`
3. `entry_source_page`

Задача: отделять проблему оффера от проблемы платежного шага.

### 4. Отвал после оплаты
Цели:
- `payment_success`;
- `login_started`;
- `paid_result_opened`.

Группировки:
1. `product`
2. `entry_source_page`

Задача: находить случаи, когда оплата подтверждена, но пользователь не открыл результат.

### 5. Источники трафика → деньги
Группировки:
1. источник трафика;
2. `utm_source`;
3. `utm_medium`;
4. `utm_campaign`;
5. `landing_cluster`;
6. `landing_page`.

Цели:
- `product_cta_click`;
- `payment_success`.

Задача: сравнивать поиск, Telegram, прямые заходы и внешние кампании не по визитам, а по оплатам.

### 6. Диагностика ошибок
События:
- `payment_failed` с `error_code`;
- `payment_cancelled`;
- `analysis_failed` с `stage`.

Задача: технический контроль продуктовой воронки.

## Рекомендуемые группировки в уже созданных воронках

Во все пять продуктовых воронок добавить:
1. `entry_source_cluster`;
2. `entry_source_page`;
3. `landing_cluster`;
4. `landing_page`;
5. `utm_source`;
6. `utm_campaign`.

Для воронок конкретного продукта `product` можно не добавлять: он фиксирован самой воронкой.

## Доход

В подтверждённое событие `payment_success` передаются:
- `product`;
- `product_id`;
- `order_id`;
- `amount`.

Суммы:
- письмо — 390;
- документ — 590;
- объяснение — 290;
- проверка договора — 490;
- полный разбор — 1490.

`payment_success` отправляется только после подтверждённого доступа к результату. Событие после платежного redirect отдельно как продажа больше не учитывается, чтобы не задваивать покупки.
