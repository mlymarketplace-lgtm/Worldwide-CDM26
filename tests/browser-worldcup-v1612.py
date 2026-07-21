from playwright.sync_api import sync_playwright
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
DATA = {
    '/data/teams.json': json.loads((ROOT/'data/teams.json').read_text()),
    '/data/knockout-locks.json': json.loads((ROOT/'data/knockout-locks.json').read_text()),
    '/live.json': json.loads((ROOT/'live.json').read_text()),
    '/data/team-results.json': json.loads((ROOT/'data/team-results.json').read_text()),
    '/data/world-news.json': json.loads((ROOT/'data/world-news.json').read_text()),
    '/.netlify/functions/news-cms': {'articles': []},
}
code = (ROOT/'assets/js/computed-team-state.js').read_text()
html = f"""<!doctype html><html><body>
<div id="qg-app-root"></div><section id="v10-team-selector">LEGACY BELGIQUE-SENEGAL</section>
<script>
const N=window.URLSearchParams;window.URLSearchParams=class extends N{{constructor(input){{super(input===''?'?mode=worldcup&v=1612':input)}}}};
const D={json.dumps(DATA,ensure_ascii=False)};
window.fetch=async u=>{{const p=String(u).split('?')[0];return{{ok:D[p]!==undefined,json:async()=>D[p]}}}};
window.history.replaceState=function(){{}};
</script><script>{code}</script></body></html>"""
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox','--disable-dev-shm-usage'])
    page = browser.new_page()
    page.set_content(html, wait_until='domcontentloaded', timeout=30000)
    page.wait_for_timeout(1200)
    assert page.locator('#qg-app-root .qg16-worldcup-main').count() == 1
    assert page.locator('#qg-app-root .qg16-memory-team').count() >= 16
    assert page.locator('#v10-team-selector').inner_text() == 'LEGACY BELGIQUE-SENEGAL'
    text = page.locator('#qg-app-root').inner_text().lower()
    assert 'choisissez une nation' in text
    assert 'belgique vs sénégal' not in text
    browser.close()
print('PASS browser DOM — worldcup rendered in the dedicated root with 16 teams')
