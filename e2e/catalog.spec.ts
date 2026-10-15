import { test, expect } from "@playwright/test";
import { ensureLoggedIn } from "./helpers";

test.describe("Catalog page", () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedIn(page);
  });

  test("renders catalog heading and title count", async ({ page }) => {
    await page.goto("/catalog");
    await expect(page.locator("h2:has-text('Full catalog')")).toBeVisible();
    await expect(page.locator("text=/\\d+ titles? across all eight services/")).toBeVisible();
  });

  test("shows service sidebar with links", async ({ page }) => {
    await page.goto("/catalog");
    await expect(page.locator(".service-sidebar")).toBeVisible();
    await expect(page.locator(".service-sidebar a[href='/catalog']")).toBeVisible();
    await expect(page.locator(".service-sidebar a[href='/service/netflix']")).toBeVisible();
  });

  test("grid layout is the default view", async ({ page }) => {
    await page.goto("/catalog");
    await expect(page.locator(".title-grid")).toBeVisible();
  });

  test("list layout shows table with correct columns", async ({ page }) => {
    await page.goto("/catalog?layout=list");
    const table = page.locator("table.table");
    await expect(table).toBeVisible();
    await expect(table.locator("th:has-text('Title')")).toBeVisible();
    await expect(table.locator("th:has-text('Type')")).toBeVisible();
    await expect(table.locator("th:has-text('Rating')")).toBeVisible();
    await expect(table.locator("th:has-text('Released')")).toBeVisible();
    await expect(table.locator("th:has-text('Streaming on')")).toBeVisible();
  });

  test("popularity sort shows rank column in list view", async ({ page }) => {
    await page.goto("/catalog?sort=pop&layout=list");
    const table = page.locator("table.table");
    await expect(table.locator("th:has-text('Popularity')")).toBeVisible();
    await expect(table.locator("text=No. 1").first()).toBeVisible();
  });

  test("popularity sort shows rank labels in grid view", async ({ page }) => {
    await page.goto("/catalog?sort=pop");
    await expect(page.locator("text=No. 1").first()).toBeVisible();
  });

  test("filter by type FILM shows only films", async ({ page }) => {
    await page.goto("/catalog?type=FILM&layout=list");
    const typeCells = page.locator("table.table tbody td:nth-child(2)");
    const count = await typeCells.count();
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 5); i++) {
        await expect(typeCells.nth(i)).toContainText("Film");
      }
    }
  });

  test("filter by type SERIES shows only series", async ({ page }) => {
    await page.goto("/catalog?type=SERIES&layout=list");
    const typeCells = page.locator("table.table tbody td:nth-child(2)");
    const count = await typeCells.count();
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 5); i++) {
        await expect(typeCells.nth(i)).toContainText("Series");
      }
    }
  });

  test("sort by date renders without error", async ({ page }) => {
    await page.goto("/catalog?sort=date");
    await expect(page.locator("h2:has-text('Full catalog')")).toBeVisible();
  });

  test("combining multiple filters works", async ({ page }) => {
    await page.goto("/catalog?type=FILM&genre=Western&sort=pop&year=2025");
    await expect(page.locator("h2:has-text('Full catalog')")).toBeVisible();
  });

  test("no results shows empty state", async ({ page }) => {
    await page.goto("/catalog?year=1800");
    await expect(page.getByText("Nothing matches those filters")).toBeVisible();
  });
});

test.describe("Filter bar interactions", () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedIn(page);
  });

  test("clicking sort radio updates URL", async ({ page }) => {
    await page.goto("/catalog");
    await page.locator("label:has-text('Popularity')").click();
    await page.waitForURL(/sort=pop/);
  });

  test("clicking type radio updates URL", async ({ page }) => {
    await page.goto("/catalog");
    await page.locator("label:has-text('Films')").click();
    await page.waitForURL(/type=FILM/);
  });

  test("selecting genre from dropdown updates URL", async ({ page }) => {
    await page.goto("/catalog");
    await page.locator("select[name='genre']").selectOption("Horror");
    await page.waitForURL(/genre=Horror/);
  });

  test("selecting year from dropdown updates URL", async ({ page }) => {
    await page.goto("/catalog");
    const yearSelect = page.locator("select[name='year']");
    await yearSelect.selectOption("2024");
    await page.waitForURL(/year=2024/);
  });

  test("switching view to list updates URL", async ({ page }) => {
    await page.goto("/catalog");
    await page.locator("label:has-text('List')").click();
    await page.waitForURL(/layout=list/);
  });

  test("switching view back to grid updates URL", async ({ page }) => {
    await page.goto("/catalog?layout=list");
    await page.locator("label:has-text('Grid')").click();
    await page.waitForURL(/\/catalog\?/);
  });
});
