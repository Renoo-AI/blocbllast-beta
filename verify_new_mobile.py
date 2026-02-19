import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        # Use a mobile device descriptor
        iphone_13 = p.devices['iPhone 13']
        browser = await p.chromium.launch()
        context = await browser.new_context(**iphone_13)
        page = await context.new_page()

        # Navigate to the home page
        await page.goto('http://localhost:5173')
        await page.wait_for_selector('text=GAMEBOX')
        await page.screenshot(path='/home/jules/verification/home_mobile_new.png')

        # Test Merge 2048
        # Find the button and scroll into view
        btn_2048 = page.get_by_role("button", name="PLAY NOW").nth(2)
        await btn_2048.scroll_into_view_if_needed()
        await btn_2048.click()
        await page.wait_for_selector('text=Merge 2048')
        await page.screenshot(path='/home/jules/verification/game_2048_mobile.png')

        # Back to Home
        await page.click('button:has(svg)') # Back button
        await page.wait_for_selector('text=GAMEBOX')

        # Test Emoji Match
        btn_match = page.get_by_role("button", name="PLAY NOW").nth(3)
        await btn_match.scroll_into_view_if_needed()
        await btn_match.click()
        await page.wait_for_selector('text=Emoji Match')
        await page.screenshot(path='/home/jules/verification/game_match_mobile.png')

        await browser.close()

if __name__ == '__main__':
    asyncio.run(run())
