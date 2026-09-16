from pathlib import Path
import re
from datetime import date

ROOT = Path(__file__).resolve().parents[1]

PAGES = {
    "sostavit-pretenziyu-online": {
        "hero_alt": "Сергей разбирает документы перед подготовкой претензии",
        "inside_alt": "Сергей изучает документы для подготовки претензии",
        "title": "Составить претензию онлайн",
        "desc": "Общий сценарий: собрать факты, документы и сформулировать требование.",
    },
    "pretenziya-postavshchiku": {
        "hero_alt": "Сергей разбирает документы по спорной поставке",
        "inside_alt": "Сергей проверяет документы и условия поставки",
        "title": "Претензия поставщику",
        "desc": "Если проблема связана с поставкой, товаром, документами или возвратом оплаты.",
    },
    "otvet-na-pretenziyu": {
        "hero_alt": "Сергей читает полученную претензию",
        "inside_alt": "Сергей готовит ответ на претензию по документам",
        "title": "Ответ на претензию",
        "desc": "Если претензия пришла вам и нужно проверить требования и подготовить ответ.",
    },
    "pretenziya-po-dogovoru-okazaniya-uslug": {
        "hero_alt": "Сергей изучает договор оказания услуг и документы",
        "inside_alt": "Сергей проверяет документы по оказанным услугам",
        "title": "Претензия по договору оказания услуг",
        "desc": "Если услуга не оказана, оказана не полностью, с недостатками или нарушен срок.",
    },
    "pretenziya-o-narushenii-srokov-postavki": {
        "hero_alt": "Сергей проверяет сроки поставки по документам",
        "inside_alt": "Сергей разбирает ситуацию с задержкой поставки",
        "title": "Претензия о нарушении сроков поставки",
        "desc": "Если срок поставки уже нарушен и нужно зафиксировать формальное требование.",
    },
}

def insert_og_image(html, slug):
    if 'property="og:image"' in html:
        return html
    marker = f'  <meta property="og:url" content="https://proverjdo.ru/{slug}/">'
    og = f'\n  <meta property="og:image" content="https://proverjdo.ru/assets/seo-images/{slug}-hero.webp">'
    return html.replace(marker, marker + og, 1)

def ensure_favicon(html):
    if 'rel="icon"' in html:
        return html
    marker = '  <link rel="canonical"'
    pos = html.find(marker)
    if pos == -1:
        return html
    end = html.find('\n', pos)
    return html[:end+1] + '  <link rel="icon" href="/favicon.ico" sizes="any">\n' + html[end+1:]

def staticize_images(html, slug, hero_alt, inside_alt):
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
        # Вставляем после первого H2 в обычной статье.
        pat = re.compile(r'(<section class="story-section(?: alt)?"><div class="narrow"><h2>.*?</h2>)', re.S)
        img = (
            f'<img class="story-photo story-inline-photo" src="{inside_src}" '
            f'alt="{inside_alt}" width="1280" height="720" loading="lazy" decoding="async">'
        )
        html, n = pat.subn(r'\1' + img, html, count=1)
        if n != 1:
            raise RuntimeError(f"Не удалось вставить внутреннее фото для {slug}")
    return html

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
        '\n  <section class="story-section alt" id="pretension-cluster-links" '
        'aria-label="Другие материалы о претензиях"><div class="narrow">'
        '<p class="story-kicker">Претензии</p><h2>Другие сценарии</h2>'
        f'<div class="story-links">{"".join(cards)}</div></div></section>\n'
    )

def ensure_cluster_links(html, slug):
    if 'id="pretension-cluster-links"' in html:
        return html
    return html.replace('</main>', cluster_block(slug) + '</main>', 1)

changed = []
for slug, cfg in PAGES.items():
    path = ROOT / slug / "index.html"
    html = path.read_text(encoding="utf-8")
    original = html
    html = insert_og_image(html, slug)
    html = ensure_favicon(html)
    html = staticize_images(html, slug, cfg["hero_alt"], cfg["inside_alt"])
    html = ensure_cluster_links(html, slug)
    if html != original:
        path.write_text(html, encoding="utf-8")
        changed.append(str(path.relative_to(ROOT)))

# Убираем JS-дорисовку изображений для кластера претензий:
metrika = ROOT / "assets" / "metrika.js"
js = metrika.read_text(encoding="utf-8")
js0 = js
for slug in PAGES:
    js = re.sub(
        rf"\n\s*'/{re.escape(slug)}/':\{{slug:'{re.escape(slug)}'.*?\}},",
        "",
        js,
        count=1
    )
if js != js0:
    metrika.write_text(js, encoding="utf-8")
    changed.append("assets/metrika.js")

# Обновляем lastmod пяти URL.
sitemap = ROOT / "sitemap.xml"
xml = sitemap.read_text(encoding="utf-8")
xml0 = xml
for slug in PAGES:
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
print("\nГотово. Проверьте git diff перед коммитом.")
