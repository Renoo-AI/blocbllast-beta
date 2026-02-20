from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        # iPhone 12 viewport
        iphone = p.devices['iPhone 12']
        browser = p.webkit.launch()
        context = browser.new_context(**iphone)
        page = context.new_page()

        # Go to app
        page.goto('http://localhost:5173')
        time.sleep(2)

        # Take screenshot of home
        page.screenshot(path='/home/jules/verification/mobile_home.png')

        # Click Block Puzzle
        page.click('text="Block Puzzle"')
        time.sleep(1)

        # Get a piece in the selector
        # They are inside PieceSelector
        pieces = page.query_selector_all('.cursor-grab')
        if pieces:
            piece = pieces[0]
            box = piece.bounding_box()

            # Start drag
            page.mouse.move(box['x'] + box['width']/2, box['y'] + box['height']/2)
            page.mouse.down()

            # Drag to center of screen
            page.mouse.move(200, 300)
            time.sleep(1)

            # Take screenshot of drag
            page.screenshot(path='/home/jules/verification/mobile_drag_iphone.png')

            page.mouse.up()

        # Other games
        page.goto('http://localhost:5173')
        time.sleep(1)

        page.click('text="Fruit Merge"')
        time.sleep(1)
        page.screenshot(path='/home/jules/verification/mobile_fruit_merge.png')

        browser.close()

if __name__ == '__main__':
    run()
