from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# 1. Favicon: претензия о нарушении сроков поставки
p = ROOT / "pretenziya-o-narushenii-srokov-postavki" / "index.html"
html = p.read_text(encoding="utf-8")

canonical = '<link rel="canonical" href="https://proverjdo.ru/pretenziya-o-narushenii-srokov-postavki/">'
favicon = '<link rel="icon" href="/favicon.ico" sizes="any">'

if favicon not in html:
    if canonical not in html:
        raise RuntimeError("Не найден canonical на странице претензии")
    html = html.replace(canonical, canonical + favicon, 1)
    p.write_text(html, encoding="utf-8")
    print("Добавлен favicon:", p)
else:
    print("Favicon уже есть:", p)

# 2. /proverit-dogovor/: meta description + logo в Organization provider
p = ROOT / "proverit-dogovor" / "index.html"
html = p.read_text(encoding="utf-8")

old_meta = (
    '<meta name="description" content="Проверить договор онлайн перед подписанием: '
    'найти риски, штрафы, спорные условия, проблемы с оплатой и расторжением. '
    'Первый риск бесплатно, полный разбор — 490 ₽.">'
)
new_meta = (
    '<meta name="description" content="Проверьте договор перед подписанием: риски, штрафы, '
    'спорные условия, оплата и расторжение. Первый риск бесплатно, полный разбор — 490 ₽.">'
)

if old_meta in html:
    html = html.replace(old_meta, new_meta, 1)
    print("Сокращён meta description:", p)
elif new_meta in html:
    print("Meta description уже исправлен:", p)
else:
    raise RuntimeError("Не найден ожидаемый meta description на /proverit-dogovor/")

old_org = '"provider":{"@type":"Organization","name":"Проверь до","url":"https://proverjdo.ru/"}'
new_org = (
    '"provider":{"@type":"Organization","name":"Проверь до",'
    '"url":"https://proverjdo.ru/",'
    '"logo":"https://proverjdo.ru/assets/proverjdo-logo.svg?v=20260908-2"}'
)

if old_org in html:
    html = html.replace(old_org, new_org, 1)
    print("Добавлен logo в Organization schema:", p)
elif new_org in html:
    print("Organization logo уже исправлен:", p)
else:
    raise RuntimeError("Не найден Organization provider на /proverit-dogovor/")

p.write_text(html, encoding="utf-8")

print("\nГотово. Теперь выполните:")
print("git diff")
print('git add pretenziya-o-narushenii-srokov-postavki/index.html proverit-dogovor/index.html')
print('git commit -m "Fix favicon and contract SEO metadata"')
print("git push origin main")
