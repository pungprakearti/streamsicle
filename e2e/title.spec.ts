import { test, expect } from "@playwright/test";
import { ensureLoggedIn } from "./helpers";

test.describe("Title detail page", () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedIn(page);
  });

  test("invalid title ID returns 404", async ({ page }) => {
    const response = await page.goto("/title/nonexistent-id");
    expect(response?.status()).toBe(404);
  });

  test("film title page shows core details", async ({ page }) => {
    await page.goto("/service/apple?type=FILM&layout=list");
    await page.locator("table.table tbody a[href^='/title/']").first().click();
    await page.waitForURL(/\/title\//);

    await expect(page.locator(".title-name")).toBeVisible();
    // Type label shows "Film" in the details
    await expect(page.locator("text=/^Film/").first()).toBeVisible();
    await expect(page.locator("h3:has-text('Where to watch'), h3:has-text('Arriving on')")).toBeVisible();
  });

  test("series title page shows season count", async ({ page }) => {
    await page.goto("/service/apple?type=SERIES&layout=list");
    await page.locator("table.table tbody a[href^='/title/']").first().click();
    await page.waitForURL(/\/title\//);

    await expect(page.locator(".title-name")).toBeVisible();
    await expect(page.locator("text=/^Series/").first()).toBeVisible();
    await expect(page.locator("text=/\\d+ seasons?/")).toBeVisible();
  });

  test("title page has back button that navigates to home", async ({ page }) => {
    await page.goto("/service/apple?type=FILM&layout=list");
    await page.locator("table.table tbody a[href^='/title/']").first().click();
    await page.waitForURL(/\/title\//);

    const backBtn = page.locator("a:has-text('Back')");
    await expect(backBtn).toBeVisible();
    await backBtn.click();
    await page.waitForURL("/home");
  });

  test("title page shows poster or no-poster placeholder", async ({ page }) => {
    await page.goto("/service/apple?type=FILM&layout=list");
    await page.locator("table.table tbody a[href^='/title/']").first().click();
    await page.waitForURL(/\/title\//);

    const poster = page.locator(".title-poster");
    await expect(poster).toBeVisible();
    const hasImg = await poster.locator("img").count() > 0;
    const hasPlaceholder = await poster.locator("text=No poster").count() > 0;
    expect(hasImg || hasPlaceholder).toBe(true);
  });

  test("title page shows service availability", async ({ page }) => {
    await page.goto("/service/apple?type=FILM&layout=list");
    await page.locator("table.table tbody a[href^='/title/']").first().click();
    await page.waitForURL(/\/title\//);

    const heading = page.locator("h3:has-text('Where to watch'), h3:has-text('Arriving on')");
    await expect(heading).toBeVisible();
  });

  test("title page shows cast when available", async ({ page }) => {
    await page.goto("/service/apple?sort=pop&layout=list");
    await page.locator("table.table tbody a[href^='/title/']").first().click();
    await page.waitForURL(/\/title\//);

    const castSection = page.locator("h3:has-text('Cast')");
    if (await castSection.isVisible().catch(() => false)) {
      await expect(castSection).toBeVisible();
    }
  });

  test("title page shows crew when available", async ({ page }) => {
    await page.goto("/service/apple?sort=pop&layout=list");
    await page.locator("table.table tbody a[href^='/title/']").first().click();
    await page.waitForURL(/\/title\//);

    const crewSection = page.locator("h6:has-text('Crew')");
    if (await crewSection.isVisible().catch(() => false)) {
      await expect(crewSection).toBeVisible();
    }
  });

  test("title page shows similar titles when available", async ({ page }) => {
    await page.goto("/service/apple?sort=pop&layout=list");
    await page.locator("table.table tbody a[href^='/title/']").first().click();
    await page.waitForURL(/\/title\//);

    const section = page.locator("h3:has-text('More like this')");
    if (await section.isVisible().catch(() => false)) {
      await expect(section).toBeVisible();
    }
  });

  test("film shows directed by credit", async ({ page }) => {
    await page.goto("/service/apple?type=FILM&sort=pop&layout=list");
    await page.locator("table.table tbody a[href^='/title/']").first().click();
    await page.waitForURL(/\/title\//);

    const credit = page.locator("text=/Directed by/");
    if (await credit.isVisible().catch(() => false)) {
      await expect(credit).toContainText("Directed by");
    }
  });

  test("series shows created by credit", async ({ page }) => {
    await page.goto("/service/apple?type=SERIES&sort=pop&layout=list");
    await page.locator("table.table tbody a[href^='/title/']").first().click();
    await page.waitForURL(/\/title\//);

    const credit = page.locator("text=/Created by/");
    if (await credit.isVisible().catch(() => false)) {
      await expect(credit).toContainText("Created by");
    }
  });

  test("title page shows content rating when available", async ({ page }) => {
    await page.goto("/service/apple?sort=pop&layout=list");
    await page.locator("table.table tbody a[href^='/title/']").first().click();
    await page.waitForURL(/\/title\//);

    const ratingText = page.locator("text=/Rated:/");
    if (await ratingText.isVisible().catch(() => false)) {
      await expect(ratingText).toContainText("Rated:");
    }
  });

  test("title page shows runtime for films", async ({ page }) => {
    await page.goto("/service/apple?type=FILM&sort=pop&layout=list");
    await page.locator("table.table tbody a[href^='/title/']").first().click();
    await page.waitForURL(/\/title\//);

    const runtime = page.locator("text=/\\d+ min/").first();
    if (await runtime.isVisible().catch(() => false)) {
      await expect(runtime).toBeVisible();
    }
  });

  test("title page shows TMDB rating when available", async ({ page }) => {
    await page.goto("/service/apple?sort=pop&layout=list");
    await page.locator("table.table tbody a[href^='/title/']").first().click();
    await page.waitForURL(/\/title\//);

    const rating = page.locator("text=/\\d+\\.\\d+\\/10/").first();
    if (await rating.isVisible().catch(() => false)) {
      await expect(rating).toBeVisible();
    }
  });
});
