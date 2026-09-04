#!/usr/bin/env python3
import json
import re
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin
from urllib.request import Request, urlopen

SOURCE_URL = 'https://new.kenyalaw.org/judgments/KEHC/'
OUTPUT = Path('data/kenya-high-court.json')
MAX_ITEMS = 12

class JudgmentParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.current_href = None
        self.current_text = []
        self.items = []

    def handle_starttag(self, tag, attrs):
        if tag.lower() != 'a':
            return
        href = dict(attrs).get('href', '')
        decoded = unquote(href)
        if '/akn/ke/judgment/kehc/' in decoded:
            self.current_href = href
            self.current_text = []

    def handle_data(self, data):
        if self.current_href:
            self.current_text.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == 'a' and self.current_href:
            text = ' '.join(' '.join(self.current_text).split())
            if text:
                self.items.append((self.current_href, text))
            self.current_href = None
            self.current_text = []


def fetch_html():
    req = Request(
        SOURCE_URL,
        headers={
            'User-Agent': 'Mozilla/5.0 (compatible; CLYD3-KenyaLawFeed/1.0; +https://clyd3.com)',
            'Accept': 'text/html,application/xhtml+xml',
            'Accept-Language': 'en-KE,en;q=0.9',
        },
    )
    with urlopen(req, timeout=30) as response:
        return response.read().decode('utf-8', errors='replace')


def normalize_item(href, text):
    url = urljoin(SOURCE_URL, href)
    decoded_url = unquote(url)
    citation_match = re.search(r'\[(\d{4})\]\s*KEHC\s*(\d+)\s*\(KLR\)', text, re.I)
    date_match = re.search(r'(\d{4}-\d{2}-\d{2})', decoded_url)
    if not date_match:
        date_match = re.search(r'\((\d{1,2}\s+[A-Za-z]+\s+\d{4})\)', text)
    decision_type_match = re.search(r'\((Judgment|Ruling|Sentence|Order|Directions)\)\s*$', text, re.I)

    citation = ''
    if citation_match:
        citation = f'[{citation_match.group(1)}] KEHC {citation_match.group(2)} (KLR)'

    date_value = ''
    if date_match:
        raw = date_match.group(1)
        try:
            if re.match(r'^\d{4}-', raw):
                date_value = raw
            else:
                date_value = datetime.strptime(raw, '%d %B %Y').date().isoformat()
        except ValueError:
            date_value = ''

    title = text
    if citation:
        title = text.split(citation, 1)[0].strip()
    title = re.sub(r'\s*\([^()]+\)\s*$', '', title).strip() if len(title) > 220 else title

    return {
        'title': title,
        'citation': citation,
        'date': date_value,
        'type': decision_type_match.group(1).title() if decision_type_match else 'Decision',
        'url': url,
    }


def main():
    html = fetch_html()
    parser = JudgmentParser()
    parser.feed(html)

    seen = set()
    decisions = []
    for href, text in parser.items:
        item = normalize_item(href, text)
        key = item['url']
        if key in seen:
            continue
        seen.add(key)
        decisions.append(item)
        if len(decisions) >= MAX_ITEMS:
            break

    if not decisions:
        raise RuntimeError('No High Court decisions found; existing feed left untouched.')

    payload = {
        'source': 'Kenya Law / National Council for Law Reporting',
        'source_url': SOURCE_URL,
        'generated_at': datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
        'decisions': decisions,
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Wrote {len(decisions)} decisions to {OUTPUT}')

if __name__ == '__main__':
    main()
