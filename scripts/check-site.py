"""Browser smoke checks; requires Python Playwright and Chromium.

SKIT_TEST_URL=http://127.0.0.1:4173 python scripts/check-site.py
SKIT_TEST_OFFLINE=1 tests the single-HTML distribution with external requests blocked.
"""
import os
import tempfile
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = os.environ.get('SKIT_TEST_URL', 'http://127.0.0.1:4173/').rstrip('/') + '/'
OFFLINE = os.environ.get('SKIT_TEST_OFFLINE') == '1'
OUT = Path(os.environ.get('SKIT_QA_DIR', str(Path(tempfile.gettempdir())/'skit-site-check')))
OUT.mkdir(parents=True, exist_ok=True)
CHROMIUM = os.environ.get('SKIT_CHROMIUM_PATH', '/usr/bin/chromium')
CASES = [(320,568,False,True,True), (390,844,False,True,True), (768,1024,False,True,True), (1024,768,False,True,True), (1487,1058,False,True,True), (390,844,True,True,True), (390,844,False,False,True), (390,844,False,False,False)]
if OFFLINE:
    CASES = [CASES[1], CASES[4], CASES[5], CASES[6], CASES[7]]

with sync_playwright() as engine:
    options = {'headless':True,'args':['--no-sandbox']}
    if Path(CHROMIUM).is_file(): options['executable_path'] = CHROMIUM
    browser = engine.chromium.launch(**options)
    for width,height,reduced,webgl,javascript in CASES:
        tag = f'{"offline" if OFFLINE else "project"}-{width}-{int(reduced)}-{int(webgl)}-{int(javascript)}'
        context = browser.new_context(viewport={'width':width,'height':height}, device_scale_factor=1, has_touch=width<761, is_mobile=width<761, reduced_motion='reduce' if reduced else 'no-preference', java_script_enabled=javascript)
        if not webgl and javascript:
            context.add_init_script("const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type.includes('webgl')?null:get.call(this,type,...args)}")
        page = context.new_page()
        errors, external = [], []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.on('console', lambda message: errors.append(message.text) if message.type=='error' else None)
        if OFFLINE:
            def guard(route):
                url = route.request.url
                if url==URL or url.startswith(('blob:', 'data:')):
                    route.continue_()
                else:
                    external.append(url[:120]);route.abort()
            context.route('**/*', guard)
        page.goto(URL, wait_until='load', timeout=60000)
        page.bring_to_front()
        page.wait_for_timeout(2100 if javascript else 100)
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'), ('overflow',tag)
        for line in page.locator('.title-line').all():
            assert line.evaluate('(e)=>e.scrollWidth<=e.clientWidth+1'), ('clipped title',tag)
        assert page.locator('.direction').count()==6
        assert page.locator('.hero-product').get_attribute('src').startswith('data:') if OFFLINE else page.locator('.hero-product').get_attribute('src').endswith('tablet-real.jpg')
        page.screenshot(path=str(OUT/(tag+'-hero.png')))

        # Native opening/closing works even when scripts are disabled.
        toggle = page.locator('.menu-toggle')
        toggle.tap() if width<761 else toggle.click()
        page.wait_for_function('document.querySelector("#site-menu").open')
        page.wait_for_timeout(750)
        assert page.locator('.menu-list a').count()==6
        page.screenshot(path=str(OUT/(tag+'-menu.png')))
        if javascript:
            assert page.locator('main').evaluate('(e)=>e.inert')
            page.keyboard.press('Escape')
            page.wait_for_function('!document.querySelector("#site-menu").open')
            assert not page.locator('main').evaluate('(e)=>e.inert')
            toggle.tap() if width<761 else toggle.click()
            page.locator('.menu-list a[href="#production"]').click()
            page.wait_for_function('!document.querySelector("#site-menu").open')
            assert page.url.endswith('#production')
        else:
            toggle.tap()
            page.wait_for_function('!document.querySelector("#site-menu").open')

        for detail in page.locator('.direction').all():
            detail.locator('summary').click()
            assert detail.get_attribute('open') is not None
            assert 'mail@skitlab.ru' in detail.locator('a').get_attribute('href')
            detail.locator('summary').click()
        page.locator('.spec-sheet summary').click()
        assert page.locator('.spec-sheet').get_attribute('open') is not None
        assert page.locator('.spec-sheet dd').count()==8
        page.locator('.spec-sheet summary').click()

        if javascript:
            page.locator('#gallery-next').click()
            page.wait_for_function('document.querySelector("#gallery-count").textContent==="02 / 03"')
            page.locator('#gallery-prev').click()
            page.wait_for_function('document.querySelector("#gallery-count").textContent==="01 / 03"')
            page.add_style_tag(content='html{scroll-behavior:auto!important}')
            top = page.locator('#kns').evaluate('(e)=>e.getBoundingClientRect().top+scrollY')
            length = page.locator('#kns').evaluate('(e)=>e.offsetHeight-e.querySelector(".kns-sticky").offsetHeight')
            page.evaluate('(top)=>scrollTo({top,behavior:"instant"})', top)
            mode = 'webgl' if webgl else 'fallback'
            page.wait_for_function('(mode)=>document.querySelector("#kns").dataset.renderMode===mode', arg=mode, timeout=60000)
            if reduced:
                assert page.locator('.kns-sticky').evaluate('(e)=>getComputedStyle(e).position')=='relative'
            if not reduced:
                rotations = []
                for chapter,progress in enumerate([.04,.36,.62,.91]):
                    page.evaluate('([t,l,p])=>scrollTo({top:t+l*p,behavior:"instant"})', [top,length,progress])
                    page.wait_for_function('(n)=>document.querySelector("#kns").dataset.chapter===String(n)',arg=chapter)
                    page.wait_for_timeout(600)
                    rotations.append(page.locator('#kns-canvas').get_attribute('data-rotation'))
                if webgl: assert len(set(rotations))==4,rotations
            page.locator('[data-kns-step="2"]').click()
            page.wait_for_function('document.querySelector("#kns").dataset.chapter==="2"')
            assert page.locator('#kns-metric').inner_text()=='≥93%'
            if not webgl:
                fallback=page.locator('.kns-fallback');fallback.evaluate('(i)=>i.decode()');assert fallback.is_visible()
            page.wait_for_timeout(900)
            page.screenshot(path=str(OUT/(tag+'-kns.png')))
            # The fixed menu must remain tappable while the 3D scene is visible.
            toggle.tap() if width<761 else toggle.click()
            page.wait_for_function('document.querySelector("#site-menu").open')
            page.keyboard.press('Escape');page.wait_for_function('!document.querySelector("#site-menu").open')
        assert page.locator('.email').get_attribute('href')=='mailto:mail@skitlab.ru'
        assert not external,external
        assert not errors,errors
        print('PASS',tag,flush=True)
        context.close()
    browser.close()
print('Screenshots:',OUT,flush=True)
