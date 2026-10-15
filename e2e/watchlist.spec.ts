import { test, expect } from "@playwright/test";
import { ensureLoggedIn } from "./helpers";

test.describe("Watchlist page", () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedIn(page);
  });

  test("renders watchlist heading", async ({ page }) => {
    await page.goto("/watchlist");
    await expect(page.locator("h2:has-text('Your watchlist')")).toBeVisible();
  });

  test("shows count or empty message", async ({ page }) => {
    await page.goto("/watchlist");
    const countText = page.locator("text=/\\d+ titles? saved/");
    const emptyText = page.locator("text=Nothing saved yet");
    const hasCount = await countText.isVisible();
    const isEmpty = await emptyText.isVisible();
    expect(hasCount || isEmpty).toBe(true);
  });

  test("when watchlist has items, shows poster cards with attribution", async ({ page }) => {
    await page.goto("/watchlist");
    const countText = page.locator("text=/\\d+ titles? saved/");
    if (await countText.isVisible()) {
      await expect(page.locator("text=/Added by/").first()).toBeVisible();
    }
  });

  test("empty watchlist shows browse catalog link", async ({ page }) => {
    await page.goto("/watchlist");
    const emptyText = page.locator("text=Nothing saved yet");
    if (await emptyText.isVisible()) {
      await expect(page.locator("a:has-text('Browse the catalog')")).toBeVisible();
    }
  });
});

test.describe("Watchlist toggle (poster button)", () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedIn(page);
  });

  test("poster card shows watchlist bookmark button", async ({ page }) => {
    await page.goto("/service/apple");
    const bookmarkBtn = page.locator("button[aria-label='Add to watchlist'], button[aria-label='Remove from watchlist']").first();
    await expect(bookmarkBtn).toBeVisible();
  });

  test("toggling watchlist from poster card updates button", async ({ page }) => {
    await page.goto("/service/apple?sort=pop");

    // Find a title that's not on the watchlist
    const addBtn = page.locator("button[aria-label='Add to watchlist']").first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      // Should now show "Remove from watchlist"
      await expect(page.locator("button[aria-label='Remove from watchlist']").first()).toBeVisible();
      // Toggle back
      await page.locator("button[aria-label='Remove from watchlist']").first().click();
      await expect(page.locator("button[aria-label='Add to watchlist']").first()).toBeVisible();
    }
  });
});

test.describe("Watchlist toggle (title page inline button)", () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedIn(page);
  });

  test("title page shows Add to watchlist button", async ({ page }) => {
    await page.goto("/service/apple?sort=pop&layout=list");
    await page.locator("table.table tbody a[href^='/title/']").first().click();
    await page.waitForURL(/\/title\//);

    const addBtn = page.locator("button:has-text('Add to watchlist')");
    const onListBtn = page.locator("button:has-text('On your watchlist')");
    const hasAdd = await addBtn.isVisible();
    const hasOnList = await onListBtn.isVisible();
    expect(hasAdd || hasOnList).toBe(true);
  });

  test("toggling watchlist from title page updates inline button", async ({ page }) => {
    await page.goto("/service/apple?sort=pop&layout=list");
    await page.locator("table.table tbody a[href^='/title/']").first().click();
    await page.waitForURL(/\/title\//);

    const addBtn = page.locator("button:has-text('Add to watchlist')");
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await expect(page.locator("button:has-text('On your watchlist')")).toBeVisible();
      // Toggle back
      const onListBtn = page.locator("button:has-text('On your watchlist')");
      await onListBtn.hover();
      await expect(page.locator("button:has-text('Remove')")).toBeVisible();
      await page.locator("button:has-text('Remove')").click();
      await expect(page.locator("button:has-text('Add to watchlist')")).toBeVisible();
    }
  });
});
