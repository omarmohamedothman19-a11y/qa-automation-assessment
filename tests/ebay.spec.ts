import { test, expect } from '@playwright/test';

test('Search for mazda mx-5 and handle transmission filter', async ({ page }) => {
    console.log('1. Navigating to eBay...');
    await page.goto('https://www.ebay.com/', { waitUntil: 'domcontentloaded' });

    // Handle potential cookie consent banners if they pop up
    const consentButton = page.locator('button[data-testid="accept-all-btn"], #gdpr-banner-accept');
    if (await consentButton.isVisible({ timeout: 3000 })) {
        await consentButton.click();
        console.log('Cookie banner accepted.');
    }

    console.log('2. Searching for "mazda mx-5"...');
    const searchBox = page.locator('input[aria-label="Search for anything"]');
    await searchBox.fill('mazda mx-5');
    await page.keyboard.press('Enter');

    // Wait for search results to load
    await page.waitForSelector('.srp-results', { timeout: 10000 });
    console.log('Search results loaded successfully.');

    console.log('3. Checking for the Transmission filter in the sidebar...');
    const transmissionFilter = page.locator('span.x-refine__multi-select-link:has-text("Transmission"), span:text-is("Transmission")').first();

    const isFilterVisible = await transmissionFilter.isVisible({ timeout: 5000 }).catch(() => false);

    if (isFilterVisible) {
        console.log('Transmission filter found! Applying filter...');
        await transmissionFilter.click();
    } else {
        console.log('⚠️ [BLOCKER / NOTE]: Transmission filter UI facet is NOT available for this keyword search.');
        console.log('Executing automated workaround: Refining search query with transmission type...');
        
        // Workaround: Search with explicit keyword modification
        await searchBox.click();
        await searchBox.fill('mazda mx-5 manual');
        await page.keyboard.press('Enter');
        
        // CRITICAL FIX: Wait for the main results list to re-appear after the second search
        await page.waitForSelector('.srp-results, .s-item', { timeout: 10000 });
    }

    console.log('4. Validating total search results count...');
    
    // Target the specific span that holds the total count (e.g., "3,300+")
    const totalCountSpan = page.locator('#srp-results-heading .BOLD').first();
    
    // Ensure the heading is visible
    await expect(totalCountSpan).toBeVisible({ timeout: 10000 });
    
    // Extract the text content safely with a non-null assertion (!)
    const totalText = (await totalCountSpan.textContent())!;
    console.log(`Validation complete. Total results reported by eBay: ${totalText}`);
    
    // Assert that the text is not empty
    expect(totalText.trim().length).toBeGreaterThan(0);
    await page.pause();
});