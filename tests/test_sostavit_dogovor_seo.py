"""Narrow static checks for the controlled contract-page SEO test.
Run: python -m unittest discover -s tests -p test_sostavit_dogovor_seo.py -v
No network calls or other page contents are read.
"""
import hashlib
import json
import re
from html.parser import HTMLParser
from pathlib import Path
import subprocess
import unittest
from urllib.parse import urljoin, urlsplit

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / 'sostavit-dogovor-online/index.html'
URL = 'https://proverjdo.ru/sostavit-dogovor-online/'
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}


class PageParser(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.errors = []
        self.nodes = []
        self.ids = []
        self.anchors = []
        self.scripts = []
        self.meta = []
        self.canonicals = []
        self.feed(html)
        if self.stack:
            self.errors.append('Unclosed elements: ' + repr([n['tag'] for n in self.stack]))

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        node = {'tag': tag, 'attrs': attrs, 'text': []}
        self.nodes.append(node)
        if attrs.get('id'):
            self.ids.append(attrs['id'])
        if tag == 'a':
            self.anchors.append(attrs.get('href', ''))
        if tag == 'meta':
            self.meta.append(attrs)
        if tag == 'link' and 'canonical' in attrs.get('rel', '').split():
            self.canonicals.append(attrs.get('href'))
        if tag == 'script':
            self.scripts.append(node)
        if tag not in VOID:
            self.stack.append(node)

    def handle_endtag(self, tag):
        if not self.stack or self.stack[-1]['tag'] != tag:
            self.errors.append('Unexpected closing tag: ' + tag)
            return
        self.stack.pop()

    def handle_data(self, data):
        for node in self.stack:
            node['text'].append(data)

    def text(self, node):
        return ' '.join(''.join(node['text']).split())


class PracticalContentTest(unittest.TestCase):
    def test_head_and_search_intent_are_unchanged(self):
        html = PAGE.read_text(encoding='utf-8')
        head = re.search(r'<head>.*?</head>', html, re.S).group()
        self.assertEqual(hashlib.sha256(head.encode()).hexdigest(), '2eb460821df2211561b888b424fa957c74a6548bc0cce0a7a61dac93195c5069')
        page = PageParser(html)
        self.assertEqual([page.text(n) for n in page.nodes if n['tag'] == 'h1'], ['Составить договор онлайн'])
        self.assertEqual(page.canonicals, [URL])
        self.assertFalse([m for m in page.meta if m.get('name', '').lower() in ('robots', 'googlebot', 'yandex')])

    def test_json_ld_is_valid_and_matches_the_page(self):
        page = PageParser(PAGE.read_text(encoding='utf-8'))
        scripts = [n for n in page.scripts if n['attrs'].get('type') == 'application/ld+json']
        self.assertEqual(len(scripts), 1)
        data = json.loads(''.join(scripts[0]['text']))
        self.assertEqual(data['@context'], 'https://schema.org')
        self.assertEqual({n['@type'] for n in data['@graph']}, {'WebPage', 'BreadcrumbList'})
        web = next(n for n in data['@graph'] if n['@type'] == 'WebPage')
        self.assertEqual(web['url'], URL)
        crumbs = next(n for n in data['@graph'] if n['@type'] == 'BreadcrumbList')['itemListElement']
        self.assertEqual([n['position'] for n in crumbs], [1, 2])
        self.assertEqual(crumbs[-1]['item'], URL)

    def test_internal_links_resolve_to_tracked_pages_or_local_ids(self):
        page = PageParser(PAGE.read_text(encoding='utf-8'))
        paths = set()
        for href in page.anchors:
            link = urlsplit(urljoin(URL, href))
            self.assertEqual(link.scheme, 'https')
            self.assertEqual(link.netloc, 'proverjdo.ru')
            if link.fragment:
                self.assertEqual(link.path, urlsplit(URL).path)
                self.assertIn(link.fragment, page.ids)
            else:
                path = link.path.lstrip('/')
                paths.add(path + 'index.html' if path.endswith('/') or not path else path)
        result = subprocess.run(['git', 'ls-files', '--error-unmatch', '--', *sorted(paths)], cwd=ROOT, capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_no_duplicate_ids_headings_or_long_paragraphs(self):
        page = PageParser(PAGE.read_text(encoding='utf-8'))
        self.assertEqual(len(page.ids), len(set(page.ids)))
        headings = [page.text(n) for n in page.nodes if n['tag'] in ('h2', 'h3')]
        self.assertEqual(len(headings), len(set(headings)))
        paragraphs = [page.text(n) for n in page.nodes if n['tag'] == 'p' and len(page.text(n)) > 60]
        self.assertEqual(len(paragraphs), len(set(paragraphs)))

    def test_generator_destinations_and_external_scripts_are_preserved(self):
        page = PageParser(PAGE.read_text(encoding='utf-8'))
        self.assertEqual({a for a in page.anchors if a.startswith('../compose/')}, {'../compose/?mode=create', '../compose/?mode=create&kind=contract'})
        self.assertEqual([n['attrs'].get('src') for n in page.scripts if n['attrs'].get('src')], ['../assets/metrika.js?v=20260920-3'])
        self.assertFalse([n for n in page.nodes if n['tag'] in ('form', 'input', 'iframe')])

    def test_specialized_destinations_are_not_repeated(self):
        page = PageParser(PAGE.read_text(encoding='utf-8'))
        for href in ['../dogovor-okazaniya-uslug/', '../dogovor-podryada/', '../dogovor-postavki/', '../dop-soglashenie-k-dogovoru/', '../proverit-dogovor/', '../protokol-raznoglasiy-k-dogovoru/']:
            self.assertEqual(page.anchors.count(href), 1, href)

    def test_html_nesting_is_balanced(self):
        page = PageParser(PAGE.read_text(encoding='utf-8'))
        self.assertEqual(page.errors, [])

    def test_page_explains_input_missing_data_plan_and_preparation(self):
        page = PageParser(PAGE.read_text(encoding='utf-8'))
        sections = {n['attrs']['id']: page.text(n) for n in page.nodes if n['tag'] == 'section' and n['attrs'].get('id')}
        self.assertIn('example', sections)
        for label in ['Исходная ситуация', 'Что уже известно', 'Чего не хватает', 'Пример плана будущего договора', 'Что уточнить перед созданием текста']:
            self.assertIn(label, sections['example'])
        self.assertIn('Демонстрационный пример', sections['example'])
        self.assertIn('contract-choice', sections)
        for label in ['Ситуация', 'Подготовьте']:
            self.assertIn(label, sections['contract-choice'])
        self.assertIn('preparation-checklist', sections)
        checklist = next(n for n in page.nodes if n['attrs'].get('id') == 'preparation-checklist-items')
        for label in ['Стороны', 'Предмет', 'Результат', 'Сроки', 'Стоимость и порядок оплаты', 'Ответственность', 'Порядок приёмки', 'Документы и исходные данные']:
            self.assertIn(label, page.text(checklist))


if __name__ == '__main__':
    unittest.main()
