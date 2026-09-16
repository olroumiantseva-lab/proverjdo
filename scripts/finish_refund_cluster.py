from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]

PAGES = {
    "trebovanie-o-vozvrate-deneg": {
        "title": "Требование о возврате денег",
        "desc": "Если нужно зафиксировать требование вернуть оплату или перечисленные деньги.",
    },
    "pretenziya-na-vozvrat-deneg": {
        "title": "Претензия на возврат денег",
        "desc": "Если деньги не возвращают и нужно перейти к формальной претензии.",
    },
    "vozvrat-deneg-za-uslugu": {
        "title": "Возврат денег за услугу",
        "desc": "Если услуга не оказана, оказана частично или результат не соответствует договорённости.",
    },
    "vozvrat-predoplaty-po-dogovoru": {
        "title": "Возврат предоплаты по договору",
        "desc": "Если аванс или предоплата внесены, а договор не исполнен или сделка прекратилась.",
    },
    "otkaz-v-vozvrate-deneg-chto-delat": {
        "title": "Отказ в возврате денег: что делать",
        "desc": "Если вы уже потребовали деньги обратно, но получили отказ или ответа нет.",
    },
}

# На двух первых страницах перелинковка уже достаточно сильная.
TARGETS = {
    "vozvrat-deneg-za-uslugu",
    "vozvrat-predoplaty-po-dogovoru",
    "otkaz-v-vozvrate-deneg-chto-delat",
}

def cluster_block(current):
    cards = []
    for slug, cfg in PAGES.items():
        if slug == current:
            continue
        cards.append(
            f'<a class="story-link" href="../{slug}/">'
            f'<strong>{cfg["title"]}</strong><span>{cfg["desc"]}</span></a>'
        )
    return (
        '\n  <section class="story-section alt" id="refund-cluster-links" '
        'aria-label="Другие материалы о возврате денег"><div class="narrow">'
        '<p class="story-kicker">Возврат денег</p><h2>Другие сценарии</h2>'
        f'<div class="story-links">{"".join(cards)}</div></div></section>\n'
    )

changed = []

for slug in TARGETS:
    path = ROOT / slug / "index.html"
    html = path.read_text(encoding="utf-8")
    original = html

    if 'id="refund-cluster-links"' not in html:
        if '</main>' not in html:
            raise RuntimeError(f"Не найден </main> в {slug}")
        html = html.replace('</main>', cluster_block(slug) + '</main>', 1)

    if slug == "vozvrat-predoplaty-po-dogovoru":
        old_title = "Возврат предоплаты по договору — составить требование онлайн | Проверь до"
        new_title = "Возврат предоплаты по договору онлайн | Проверь до"
        html = html.replace(f"<title>{old_title}</title>", f"<title>{new_title}</title>", 1)
        html = html.replace(
            f'<meta property="og:title" content="{old_title}">',
            f'<meta property="og:title" content="{new_title}">',
            1
        )

    if html != original:
        path.write_text(html, encoding="utf-8")
        changed.append(str(path.relative_to(ROOT)))

# Обновляем lastmod только у реально изменённых URL.
sitemap = ROOT / "sitemap.xml"
xml = sitemap.read_text(encoding="utf-8")
xml0 = xml

for rel in changed:
    slug = rel.split("/")[0]
    pattern = re.compile(
        rf'(<loc>https://proverjdo\.ru/{re.escape(slug)}/</loc>\s*<lastmod>).*?(</lastmod>)',
        re.S
    )
    xml = pattern.sub(r'\g<1>2026-09-16\2', xml, count=1)

if xml != xml0:
    sitemap.write_text(xml, encoding="utf-8")
    changed.append("sitemap.xml")

print("Изменены:")
for item in changed:
    print(" -", item)

print("\nПроверка:")
for slug in PAGES:
    p = ROOT / slug / "index.html"
    text = p.read_text(encoding="utf-8")
    print(
        slug,
        "refund_cluster=", 'id="refund-cluster-links"' in text,
        "favicon=", 'rel="icon"' in text,
        "hero_static=", f'../assets/seo-images/{slug}-hero.webp' in text,
        "inside_static=", f'../assets/seo-images/{slug}-inside.webp' in text,
    )

print("\nГотово. Выполните git diff, затем commit и push.")
