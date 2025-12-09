import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the app title', async ({ page }) => {
    await expect(page.locator('text=KodLaewLong')).toBeVisible();
  });

  test('should have navigation tabs', async ({ page }) => {
    // Check for tab navigation (General, Enterprise, Manual)
    await expect(page.getByRole('link', { name: /general|ทั่วไป/i })).toBeVisible();
  });

  test('should switch between app types', async ({ page }) => {
    // Click on Enterprise tab
    const enterpriseTab = page.getByRole('link', { name: /enterprise|องค์กร/i });
    if (await enterpriseTab.isVisible()) {
      await enterpriseTab.click();
      await expect(page).toHaveURL(/type=ENTERPRISE/);
    }
  });

  test('should have language toggle', async ({ page }) => {
    // Find language toggle button
    const langToggle = page.getByRole('button', { name: /toggle language|th|en/i });
    await expect(langToggle).toBeVisible();
  });

  test('should have theme toggle', async ({ page }) => {
    // Find theme toggle button
    const themeToggle = page.getByRole('button', { name: /toggle theme|light|dark/i });
    await expect(themeToggle).toBeVisible();
  });
});

test.describe('App Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display app cards', async ({ page }) => {
    // Wait for apps to load
    await page.waitForSelector('[class*="cursor-pointer"]', { timeout: 10000 });

    // Check that at least one app card is visible
    const appCards = page.locator('[class*="cursor-pointer"]');
    await expect(appCards.first()).toBeVisible();
  });

  test('should show selection count when app is selected', async ({ page }) => {
    // Wait for apps to load
    await page.waitForSelector('[class*="cursor-pointer"]', { timeout: 10000 });

    // Click on first app card
    const firstApp = page.locator('[class*="cursor-pointer"]').first();
    await firstApp.click();

    // Check that bottom bar appears with count
    const selectionCount = page.locator('text=/1|selected|เลือก/i');
    await expect(selectionCount).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to summary page', async ({ page }) => {
    // Find and click summary link
    const summaryLink = page.getByRole('link', { name: /summary|สรุป/i });
    await summaryLink.click();

    await expect(page).toHaveURL('/summary');
  });
});

test.describe('Search and Filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have search input', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search|ค้นหา/i);
    await expect(searchInput).toBeVisible();
  });

  test('should filter apps when searching', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search|ค้นหา/i);
    await searchInput.fill('Chrome');

    // Wait for filter to apply
    await page.waitForTimeout(500);

    // Check that filtered results are shown
    const results = page.locator('text=/Chrome|found|พบ/i');
    await expect(results.first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Responsive Design', () => {
  test('should show mobile menu on small screens', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check for hamburger menu button
    const menuButton = page.getByRole('button', { name: /menu|toggle menu/i });
    await expect(menuButton).toBeVisible();
  });

  test('should open mobile menu when clicked', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Click hamburger menu
    const menuButton = page.getByRole('button', { name: /menu|toggle menu/i });
    await menuButton.click();

    // Check that mobile menu is visible
    const mobileMenu = page.locator('[class*="sm:hidden"]');
    await expect(mobileMenu.first()).toBeVisible();
  });
});
