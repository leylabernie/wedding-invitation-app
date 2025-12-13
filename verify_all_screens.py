
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        )
        page = await context.new_page()

        screens = [
            'rsvp-inbox', 'color-palette', 'guest-list', 'digital-share',
            'guest-details', 'rsvp-dashboard', 'guest-segments',
            'guest-details-segments', 'digital-share-segments',
            'dream-theme-step2', 'dream-theme-step3', 'dream-theme-summary',
            'index'
        ]

        for screen in screens:
            await page.goto(f'http://localhost:8000/{screen}.html', wait_until='networkidle')
            await page.wait_for_timeout(5000)  # Wait 5 seconds for all assets to load
            await page.screenshot(path=f'verification/{screen}.png')

        await browser.close()

asyncio.run(main())
