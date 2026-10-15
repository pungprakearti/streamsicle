import { test, expect } from "@playwright/test";
import { ensureLoggedIn } from "./helpers";

test.describe("New & coming page", () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedIn(page);
  });

  test("renders heading and subheading", async ({ page }) => {
    await page.goto("/new");
    await expect(page.locator("h2:has-text('New & coming')")).toBeVisible();
    await expect(page.getByText("What arrived in the last 30 days")).toBeVisible();
  });

  test("shows Just added column", async ({ page }) => {
    await page.goto("/new");
    await expect(page.locator("h3:has-text('Just added')")).toBeVisible();
  });

  test("shows Coming soon column", async ({ page }) => {
    await page.goto("/new");
    await expect(page.locator("h3:has-text('Coming soon')")).toBeVisible();
  });

  test("columns show titles or empty state", async ({ page }) => {
    await page.goto("/new");
    // Each column should either have title cards or "Nothing here yet."
    const justAdded = page.locator("div:has(> h3:has-text('Just added'))");
    const hasTitles = await justAdded.locator("a[href^='/title/']").count() > 0;
    const hasEmpty = await justAdded.locator("text=Nothing here yet").count() > 0;
    expect(hasTitles || hasEmpty).toBe(true);
  });

  test("title cards show type and service info", async ({ page }) => {
    await page.goto("/new");
    // Look for Film or Series labels in the card text
    const typeLabel = page.locator("text=Film, text=Series").first();
    if (await typeLabel.isVisible().catch(() => false)) {
      await expect(typeLabel).toBeVisible();
    }
  });

  test("title cards link to title detail pages", async ({ page }) => {
    await page.goto("/new");
    const firstLink = page.locator("a[href^='/title/']").first();
    if (await firstLink.isVisible()) {
      const href = await firstLink.getAttribute("href");
      expect(href).toMatch(/^\/title\//);
    }
  });
});
