import { test, expect } from "@playwright/test";
import { ensureLoggedIn } from "./helpers";

test.describe("Search", () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedIn(page);
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test("search page without query shows instructions", async ({ page }) => {
    await page.goto("/search");
    await expect(page.locator("h2:has-text('Search')")).toBeVisible();
    await expect(page.locator("text=Type a title, genre, director or service above")).toBeVisible();
  });

  test("searching navigates to search page with query param", async ({ page }) => {
    await page.goto("/home");
    const searchInput = page.locator(".desktop-header input[name='q']");
    await searchInput.fill("action");
    await searchInput.press("Enter");
    await page.waitForURL(/\/search\?q=action/);
  });

  test("search with results shows count and table", async ({ page }) => {
    await page.goto("/search?q=action");
    await expect(page.locator("text=/\\d+ titles?/").first()).toBeVisible();
    const table = page.locator("table.table");
    if (await table.isVisible()) {
      await expect(table.locator("th:has-text('Title')")).toBeVisible();
      await expect(table.locator("th:has-text('Type')")).toBeVisible();
      await expect(table.locator("th:has-text('Released')")).toBeVisible();
      await expect(table.locator("th:has-text('Available on')")).toBeVisible();
    }
  });

  test("search results show Film or Series type", async ({ page }) => {
    await page.goto("/search?q=action");
    const typeCell = page.locator("td:has-text('Film'), td:has-text('Series')").first();
    await expect(typeCell).toBeVisible();
  });

  test("search result rows link to title pages", async ({ page }) => {
    await page.goto("/search?q=action");
    const firstLink = page.locator("table.table tbody a[href^='/title/']").first();
    if (await firstLink.isVisible()) {
      const href = await firstLink.getAttribute("href");
      expect(href).toMatch(/^\/title\//);
    }
  });

  test("search with no results shows empty message", async ({ page }) => {
    await page.goto("/search?q=xyznonexistent123456");
    await expect(page.getByText("No titles found")).toBeVisible();
    await expect(page.getByText("Try adding -live")).toBeVisible();
  });

  test("search results heading shows the query", async ({ page }) => {
    await page.goto("/search?q=comedy");
    await expect(page.locator("h2")).toContainText('Results for "comedy"');
  });

  test("clear search button navigates to home", async ({ page }) => {
    await page.goto("/home");
    const searchInput = page.locator(".desktop-header input[name='q']");
    await searchInput.fill("test");
    const clearBtn = page.locator(".desktop-header").getByLabel("Clear search");
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();
    await page.waitForURL("/home");
  });

  test("search input syncs with URL query parameter", async ({ page }) => {
    await page.goto("/search?q=horror");
    const searchInput = page.locator(".desktop-header input[name='q']");
    await expect(searchInput).toHaveValue("horror");
  });

  test("clear button is hidden when search is empty", async ({ page }) => {
    await page.goto("/home");
    await expect(page.locator(".desktop-header").getByLabel("Clear search")).not.toBeVisible();
  });
});
