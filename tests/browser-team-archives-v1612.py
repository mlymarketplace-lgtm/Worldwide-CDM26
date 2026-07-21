from playwright.sync_api import sync_playwright
from pathlib import Path
import json

ROOT=Path(__file__).resolve().parents[1]
files={
 'data/teams.json':json.loads((ROOT/'data/teams.json').read_text()),
 'data/fr/teams.json':{},
 'data/team-results.json':json.loads((ROOT/'data/team-results.json').read_text()),
 'data/stories.json':json.loads((ROOT/'data/stories.json').read_text()),
 'data/fr/stories.json':{},
 'data/world-cup-archive.json':json.loads((ROOT/'data/world-cup-archive.json').read_text()),
}
css=(ROOT/'assets/css/team-page-v1612.css').read_text()
js=(ROOT/'assets/js/team-page-v1612.js').read_text()
html=f'''<!doctype html><html><head><style>{css}</style></head><body><script>
const NativeParams=window.URLSearchParams;
window.URLSearchParams=class extends NativeParams{{constructor(input){{super(input===''?'?team=spain&lang=fr&v=1612':input)}}}};
const DATA={json.dumps(files,ensure_ascii=False)};
window.fetch=async function(url){{const clean=String(url).split('?')[0].replace(/^\//,'');return {{ok:DATA[clean]!==undefined,json:async()=>DATA[clean]}}}};
</script><script>{js}</script></body></html>'''
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page(viewport={'width':390,'height':844})
    errors=[]
    page.on('pageerror', lambda exc: errors.append(str(exc)))
    page.set_content(html, wait_until='domcontentloaded', timeout=60000)
    page.wait_for_selector('[data-archive-table="groups"]', timeout=30000)
    assert page.locator('[data-archive-table]').count()==3
    assert page.locator('.qg16-group-card').count()==12
    assert page.locator('.qg16-third-table tbody tr').count()==8
    assert page.locator('.qg16-ko-match').count()==32
    story_y=page.locator('.qg16-story').bounding_box()['y']
    groups_y=page.locator('[data-archive-table="groups"]').bounding_box()['y']
    third_y=page.locator('[data-archive-table="best-third"]').bounding_box()['y']
    bracket_y=page.locator('[data-archive-table="knockout"]').bounding_box()['y']
    nav_y=page.locator('.qg16-bottom-nav').bounding_box()['y']
    assert story_y < groups_y < third_y < bracket_y < nav_y
    visible=page.locator('body').inner_text().lower()
    assert 'simulation' not in visible
    assert 'champion simulé' not in visible
    assert 'tableau final de la coupe du monde 2026' in visible
    assert page.locator('[data-match-id="N104"]').count()==1
    assert not errors, errors
    browser.close()
print('PASS browser team V16.1.2 — mobile, ordre, 12 groupes, 8 troisièmes, 32 matches, zéro simulation')
