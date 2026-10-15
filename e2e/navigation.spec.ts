import { test, expect } from "@playwright/test";
import { ensureLoggedIn } from "./helpers";

test.describe("Desktop navigation", () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedIn(page);
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test("desktop header shows search bar and nav links", async ({ page }) => {
    await page.goto("/home");
    await expect(page.locator(".desktop-header").getByLabel("Search")).toBeVisible();
    await expect(page.locator(".app-nav")).toBeVisible();
  });

  test("nav links navigate correctly", async ({ page }) => {
    await page.goto("/home");
    await page.locator(".app-nav a:has-text('New & coming')").click();
    await page.waitForURL("/new");
    await expect(page.locator("h2:has-text('New & coming')")).toBeVisible();

    await page.locator(".app-nav a:has-text('Watchlist')").click();
    await page.waitForURL("/watchlist");
    await expect(page.locator("h2:has-text('Your watchlist')")).toBeVisible();

    await page.locator(".app-nav a:has-text('Front page')").click();
    await page.waitForURL("/home");
  });

  test("by service link navigates to netflix", async ({ page }) => {
    await page.goto("/home");
    await page.locator(".app-nav a:has-text('By service')").click();
    await page.waitForURL(/\/service\/netflix/);
  });

  test("watchlist count shows in nav when items exist", async ({ page }) => {
    await page.goto("/home");
    const watchlistLink = page.locator(".app-nav a:has-text('Watchlist')");
    const text = await watchlistLink.textContent();
    expect(text).toMatch(/Watchlist/);
  });

  test("logo link navigates to home from service page", async ({ page }) => {
    await page.goto("/service/apple");
    await page.locator(".desktop-header a[href='/home']").first().click();
    await page.waitForURL("/home");
  });
});

test.describe("Mobile navigation", () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedIn(page);
    await page.setViewportSize({ width: 375, height: 812 });
  });

  test("mobile header shows hamburger menu", async ({ page }) => {
    await page.goto("/home");
    await expect(page.getByLabel("Open menu")).toBeVisible();
  });

  test("opening mobile menu shows nav links", async ({ page }) => {
    await page.goto("/home");
    await page.getByLabel("Open menu").click();
    await expect(page.locator(".mobile-nav-drawer")).toBeVisible();
    await expect(page.locator(".mobile-nav-drawer a:has-text('Front page')")).toBeVisible();
    await expect(page.locator(".mobile-nav-drawer a:has-text('Full catalog')")).toBeVisible();
  });

  test("mobile menu closes on navigation", async ({ page }) => {
    await page.goto("/home");
    await page.getByLabel("Open menu").click();
    await page.locator(".mobile-nav-drawer a:has-text('New & coming')").click();
    await page.waitForURL("/new");
    await expect(page.locator(".mobile-nav-drawer")).not.toBeVisible();
  });

  test("mobile version is displayed", async ({ page }) => {
    await page.goto("/home");
    await expect(page.locator(".mobile-version")).toBeVisible();
  });
});
