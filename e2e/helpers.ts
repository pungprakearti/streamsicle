import { type Page } from "@playwright/test";

export async function selectProfile(page: Page, profileName: string) {
  await page.goto("/");
  const profileButton = page.getByRole("button", { name: profileName });
  if (await profileButton.isVisible()) {
    await profileButton.click();
    await page.waitForURL("/home");
  }
}

export async function ensureLoggedIn(page: Page) {
  await page.goto("/home");
  if (page.url().endsWith("/")) {
    await selectProfile(page, "Andrew");
  }
}

export async function clearProfileCookie(page: Page) {
  await page.context().clearCookies();
}
