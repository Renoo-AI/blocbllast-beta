import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        iphone_13 = p.devices['iPhone 13']
        browser = await p.chromium.launch()
        context = await browser.new_context(**iphone_13)
        page = await context.new_page()

        await page.goto('http://localhost:5173')
        await page.wait_for_selector('text=GAMEBOX')
        await page.screenshot(path='/home/jules/verification/glitch_check_home.png')

        # Check Block Puzzle
        await page.click('text=Block Puzzle')
        await page.wait_for_timeout(1000)
        await page.screenshot(path='/home/jules/verification/glitch_check_blocks.png')

        # Simulate a drag to see the offset
        piece = page.locator('canvas, div').filter(has_text='Block Puzzle').locator('..').locator('div[onpointerdown]').first
        # Actually DraggablePiece has onPointerDown
        # Let's try to find a piece to drag
        pieces = page.locator('.cursor-grab')
        if await pieces.count() > 0:
            box = await pieces.first.bounding_box()
            if box:
                await page.mouse.move(box['x'] + box['width']/2, box['y'] + box['height']/2)
                await page.mouse.down()
                await page.mouse.move(box['x'] + box['width']/2, box['y'] + box['height']/2 - 100)
                await page.wait_for_timeout(500)
                await page.screenshot(path='/home/jules/verification/glitch_check_drag.png')
                await page.mouse.up()

        # Back to home
        await page.click('button:has(svg)')

        # Check Fruit Merge
        await page.click('text=Fruit Merge')
        await page.wait_for_timeout(1000)
        await page.screenshot(path='/home/jules/verification/glitch_check_fruit.png')

        # Drop a few fruits
        for _ in range(3):
            await page.mouse.click(200, 300)
            await page.wait_for_timeout(1000)
        await page.screenshot(path='/home/jules/verification/glitch_check_fruit_dropped.png')

        await browser.close()

if __name__ == '__main__':
    asyncio.run(run())
