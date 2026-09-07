import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        # Wider default timeout to match the agent's DOM-stability budget;
        # auto-waiting Playwright APIs (expect, locator.wait_for) inherit this.
        context.set_default_timeout(15000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> navigate
        await page.goto("http://localhost:3001")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Computadoras & PC' category pill to filter the home catalog by that category.
        # Computadoras & PC 18 productos link
        elem = page.get_by_role('link', name='Computadoras & PC 18 productos', exact=True)
        await elem.click(timeout=10000)
        
        # -> Type 'Smart TV' into the catalog search field (Buscar productos, marcas o tiendas en Bolivia...)
        # Buscar productos text field
        elem = page.locator('xpath=/html/body/header/div/div/div[2]/div/form/div/input')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Smart TV")
        
        # -> Clear the catalog search field (remove 'Smart TV') so the page restores the full product grid and category results text.
        # Buscar productos text field
        elem = page.locator('xpath=/html/body/header/div/div/div[2]/div/form/div/input')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("")
        
        # --> Assertions to verify final state
        
        # --> Category filter was applied (URL shows the electronica y tecnologia category).
        # Assert-outcome: passed
        # Assert: The page URL contains the category parameter.
        await expect(page).to_have_url(re.compile("category=electronica\\-y\\-tecnologia"), timeout=15000), "The page URL contains the category parameter."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    