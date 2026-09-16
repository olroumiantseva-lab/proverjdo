from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]

CLUSTER = {
    "proverit-dogovor": {
        "title": "Проверить договор",
        "desc": "Если договор уже готов и нужно проверить условия, деньги, сроки, штрафы и расторжение.",
        "hero_alt": None,
        "inside_alt": None,
    },
    "sostavit-dogovor-online": {
        "title": "Составить договор онлайн",
        "desc": "Если договор ещё нужно собрать по вашей реальной договорённости.",
        "hero_alt": "Сергей готовит договор по реальной договорённости",
        "inside_alt": "Сергей собирает условия будущего договора",
    },
    "dogovor-okazaniya-uslug": {
        "title": "Договор оказания услуг",
        "desc": "Если одна сторона оказывает услуги другой и важны объём, сроки, результат и оплата.",
        "hero_alt": "Сергей разбирает условия договора оказания услуг",
        "inside_alt": "Сергей проверяет объём услуг, сроки и результат",
    },
    "dogovor-podryada": {
        "title": "Договор подряда",
        "desc": "Если исполнитель должен выполнить работу и передать конкретный результат.",
        "hero_alt": "Сергей разбирает условия договора подряда",
        "inside_alt": "Сергей сверяет план ремонта, материалы и условия подряда",
    },
    "dogovor-postavki": {
        "title": "Договор поставки",
        "desc": "Если нужно зафиксировать товар, количество, сроки, оплату и порядок поставки.",
        "hero_alt": "Сергей изучает условия договора поставки",
        "inside_alt": "Сергей проверяет поставку, документы и комплектность",
    },
    "dop-soglashenie-k-dogovoru": {
        "title": "Дополнительное соглашение",
        "desc": "Если договор уже есть, но нужно изменить срок, цену, объём или другие условия.",
        "hero_alt": "Сергей сравнивает действующий договор и новые условия",
        "inside_alt": "Сергей проверяет изменения для дополнительного соглашения",
    },
}

IMAGE_SLUGS = {
    slug for slug, cfg in CLUSTER.items()
    if cfg["hero_alt"] and cfg["inside_alt"]
}

def ensure_favicon(html):
    if 'rel="icon"' in html:
        return html
    m = re.search(r'(<link rel="canonical"[^>]*>)', html)
    if not m:
        return html
    return html[:m.end()] + '<link rel="icon" href="/favicon.ico" sizes="any">' + html[m.end():]

def insert_og_image(html, slug):
    if slug not in IMAGE_SLUGS or 'property="og:image"' in html:
        return html
    marker = f'<meta property="og:url" content="https://proverjdo.ru/{slug}/">'
    og = f'<meta property="og:image" content="https://proverjdo.ru/assets/seo-images/{slug}-hero.webp">'
    return html.replace(marker, marker + og, 1)

def staticize_images(html, slug, hero_alt, inside_alt):
    if slug not in IMAGE_SLUGS:
        return html

    hero_src = f'../assets/seo-images/{slug}-hero.webp'
    inside_src = f'../assets/seo-images/{slug}-inside.webp'

    if hero_src not in html:
        pat = re.compile(r'(</div>)(<aside class="sergey-card">)', re.S)
        replacement = (
            r'\1<div class="story-hero-side">'
            f'<img class="story-photo story-hero-photo" src="{hero_src}" '
            f'alt="{hero_alt}" width="1280" height="720" fetchpriority="high" decoding="async">'
            r'\2</div>'
        )
        html, n = pat.subn(replacement, html, count=1)
        if n != 1:
            raise RuntimeError(f"Не удалось вставить hero для {slug}")

    if inside_src not in html:
        pat = re.compile(r'(<section class="story-section(?: alt)?(?: [^>]*)?><div class="narrow"><h2>.*?</h2>)', re.S)
        img = (
            f'<img class="story-photo story-inline-photo" src="{inside_src}" '
            f'alt="{inside_alt}" width="1280" height="720" loading="lazy" decoding="async">'
        )
        html, n = pat.subn(r'\1' + img, html, count=1)
        if n != 1:
            raise RuntimeError(f"Не удалось вставить внутреннее фото для {slug}")

    return html

def contract_cluster_block(current):
    cards = []
    for slug, cfg in CLUSTER.items():
        if slug == current:
            continue
        cards.append(
            f'<a class="story-link" href="../{slug}/">'
            f'<strong>{cfg["title"]}</strong><span>{cfg["desc"]}</span></a>'
        )
    return (
        '<section class="story-section alt" id="contract-cluster-links" '
        'aria-label="Другие материалы о договорах"><div class="narrow">'
        '<p class="story-kicker">Договоры</p><h2>Другие сценарии</h2>'
        f'<div class="story-links">{"".join(cards)}</div></div></section>'
    )

def ensure_cluster_links(html, slug):
    if 'id="contract-cluster-links"' in html:
        return html
    return html.replace('</main>', contract_cluster_block(slug) + '</main>', 1)

def fix_proverit_dogovor(html):
    # Meta description: убираем лишнюю длину без изменения смысла.
    html = html.replace(
        'Проверьте договор онлайн перед подписанием: риски, штрафы, деньги, сроки, расторжение и спорные условия. Бесплатная проверка, полный разбор — после оплаты.',
        'Проверьте договор перед подписанием: риски, штрафы, деньги, сроки, расторжение и спорные условия. Бесплатная проверка.'
    )

    # Organization schema: добавляем logo, только если его ещё нет.
    if '"@type":"Organization"' in html and '"logo"' not in html:
        html = re.sub(
            r'(\{"@type":"Organization","name":"ПРОВЕРЬ ДО")',
            r'\1,"logo":"https://proverjdo.ru/assets/proverjdo-logo.svg?v=20260908-2"',
            html,
            count=1
        )
    return html

changed = []

for slug, cfg in CLUSTER.items():
    path = ROOT / slug / "index.html"
    if not path.exists():
        raise FileNotFoundError(path)

    html = path.read_text(encoding="utf-8")
    original = html

    html = ensure_favicon(html)
    html = insert_og_image(html, slug)
    html = staticize_images(html, slug, cfg["hero_alt"], cfg["inside_alt"])
    html = ensure_cluster_links(html, slug)

    if slug == "proverit-dogovor":
        html = fix_proverit_dogovor(html)

    if html != original:
        path.write_text(html, encoding="utf-8")
        changed.append(str(path.relative_to(ROOT)))

# Убираем JS-дорисовку SEO-фото для договорных страниц.
metrika = ROOT / "assets" / "metrika.js"
js = metrika.read_text(encoding="utf-8")
js0 = js
for slug in IMAGE_SLUGS:
    js = re.sub(
        rf"\n\s*'/{re.escape(slug)}/':\{{slug:'{re.escape(slug)}'.*?\}},",
        "",
        js,
        count=1
    )
if js != js0:
    metrika.write_text(js, encoding="utf-8")
    changed.append("assets/metrika.js")

# Обновляем lastmod изменённых страниц.
sitemap = ROOT / "sitemap.xml"
xml = sitemap.read_text(encoding="utf-8")
xml0 = xml
for slug in CLUSTER:
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

print("\nПроверки:")
for slug in CLUSTER:
    text = (ROOT / slug / "index.html").read_text(encoding="utf-8")
    print(
        slug,
        "favicon=", 'rel="icon"' in text,
        "cluster=", 'id="contract-cluster-links"' in text,
        "og_image=", ('property="og:image"' in text if slug in IMAGE_SLUGS else "n/a"),
        "hero_static=", (f'../assets/seo-images/{slug}-hero.webp' in text if slug in IMAGE_SLUGS else "n/a"),
    )

print("\nГотово. Выполните git diff и затем коммит/push.")
