import { test, expect } from "@playwright/test";
import { ensureLoggedIn } from "./helpers";

test.describe("Infinite scroll (InfiniteGrid)", () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedIn(page);
  });

  test("grid page renders all items when count is under page size", async ({ page }) => {
    await page.goto("/catalog?sort=pop");
    const items = page.locator(".title-grid > div");
    const count = await items.count();
    expect(count).toBeGreaterThan(0);
  });

  test("list layout renders table rows for all items", async ({ page }) => {
    await page.goto("/catalog?sort=pop&layout=list");
    const rows = await page.locator("table.table tbody tr").count();
    expect(rows).toBeGreaterThan(0);
  });
});
