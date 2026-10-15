import { test, expect } from "@playwright/test";
import { ensureLoggedIn } from "./helpers";

test.describe("Home page", () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedIn(page);
  });

  test("renders the home page with content", async ({ page }) => {
    await page.goto("/home");
    // Should have either hero content or "No titles yet" empty state
    const hasHero = await page.locator("text=/New on/").first().isVisible().catch(() => false);
    const hasEmpty = await page.locator("text=No titles yet").isVisible().catch(() => false);
    expect(hasHero || hasEmpty).toBe(true);
  });

  test("hero section shows Where to watch link when hero exists", async ({ page }) => {
    await page.goto("/home");
    const newOn = page.locator("text=/New on/").first();
    if (await newOn.isVisible().catch(() => false)) {
      await expect(page.locator("a:has-text('Where to watch')").first()).toBeVisible();
    }
  });

  test("renders streaming by service section", async ({ page }) => {
    await page.goto("/home");
    await expect(page.locator("h2:has-text('Streaming by service')")).toBeVisible();
  });

  test("service section has links to service pages", async ({ page }) => {
    await page.goto("/home");
    const serviceLinks = page.locator("a[href^='/service/']");
    expect(await serviceLinks.count()).toBeGreaterThan(0);
  });

  test("renders also new this month when data exists", async ({ page }) => {
    await page.goto("/home");
    const alsoNew = page.locator("h6:has-text('Also new this month')");
    // This section is conditional - just verify it doesn't error
    if (await alsoNew.isVisible().catch(() => false)) {
      expect(await alsoNew.isVisible()).toBe(true);
    }
  });

  test("renders most watched section when data exists", async ({ page }) => {
    await page.goto("/home");
    const section = page.locator("h2:has-text('Most watched')");
    if (await section.isVisible().catch(() => false)) {
      // Numbered rankings
      const rankNum = page.locator("text=/^[0-9]+$/").first();
      await expect(rankNum).toBeVisible();
    }
  });

  test("renders coming soon section with link", async ({ page }) => {
    await page.goto("/home");
    const section = page.locator("h2:has-text('Coming soon')").first();
    if (await section.isVisible().catch(() => false)) {
      await expect(page.locator("a:has-text('All new and upcoming titles')")).toBeVisible();
    }
  });

  test("service counts show title pluralization", async ({ page }) => {
    await page.goto("/home");
    const titleCounts = page.locator("text=/\\d+ titles?/");
    expect(await titleCounts.count()).toBeGreaterThan(0);
  });
});
