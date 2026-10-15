import { test, expect } from "@playwright/test";
import { ensureLoggedIn } from "./helpers";

test.describe("Service page", () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedIn(page);
  });

  test("renders Netflix service page with title count", async ({ page }) => {
    await page.goto("/service/netflix");
    await expect(page.locator("h2:has-text('Netflix')")).toBeVisible();
    await expect(page.locator("text=/\\d+ titles? streaming on Netflix/")).toBeVisible();
  });

  test("service sidebar highlights active service", async ({ page }) => {
    await page.goto("/service/apple");
    const link = page.locator(".service-sidebar a[href='/service/apple']");
    await expect(link).toHaveCSS("font-weight", "600");
  });

  test("navigating between services via sidebar works", async ({ page }) => {
    await page.goto("/service/apple");
    await page.locator(".service-sidebar a[href='/service/netflix']").click();
    await page.waitForURL(/\/service\/netflix/);
    await expect(page.locator("h2:has-text('Netflix')")).toBeVisible();
  });

  test("All services link goes to catalog", async ({ page }) => {
    await page.goto("/service/apple");
    await page.locator(".service-sidebar a[href='/catalog']").click();
    await page.waitForURL(/\/catalog/);
  });

  test("invalid service slug returns 404", async ({ page }) => {
    const response = await page.goto("/service/invalid-service-slug");
    expect(response?.status()).toBe(404);
  });

  test("service page supports filter params", async ({ page }) => {
    await page.goto("/service/apple?sort=pop&type=FILM&layout=list");
    await expect(page.locator("table.table")).toBeVisible();
    await expect(page.locator("th:has-text('Popularity')")).toBeVisible();
  });

  test("service page empty filter shows message", async ({ page }) => {
    await page.goto("/service/apple?year=1800");
    await expect(page.getByText("Nothing matches those filters")).toBeVisible();
  });
});
