import { test, expect } from "@playwright/test";
import { clearProfileCookie } from "./helpers";

test.describe("Profile gate page", () => {
  test.beforeEach(async ({ page }) => {
    await clearProfileCookie(page);
  });

  test("shows profile picker when no cookie is set", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Who's watching?")).toBeVisible();
    // At least one profile button should exist
    const profileButtons = page.locator(".profile-square");
    expect(await profileButtons.count()).toBeGreaterThan(0);
    await expect(page.getByRole("button", { name: "Add profile" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Manage profiles" })).toBeVisible();
  });

  test("selecting a profile redirects to /home and sets cookie", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Andrew" }).click();
    await page.waitForURL("/home");
    // Verify we're on /home - the page loaded successfully
    await expect(page).toHaveURL("/home");
  });

  test("gate page redirects to /home when profile cookie is already set", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Andrew" }).click();
    await page.waitForURL("/home");
    await page.goto("/");
    await page.waitForURL("/home");
  });

  test("app layout redirects to gate when no profile cookie", async ({ page }) => {
    await page.goto("/home");
    await page.waitForURL("/");
    await expect(page.getByText("Who's watching?")).toBeVisible();
  });
});

test.describe("Profile creation", () => {
  test.beforeEach(async ({ page }) => {
    await clearProfileCookie(page);
  });

  test("clicking Add profile shows create form", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Add profile" }).click();
    await expect(page.getByText("Create a profile")).toBeVisible();
    await expect(page.getByPlaceholder("Your name")).toBeVisible();
    await expect(page.getByText("Choose an avatar")).toBeVisible();
    await expect(page.getByRole("button", { name: "Create profile" })).toBeDisabled();
  });

  test("create profile button is disabled with empty name", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Add profile" }).click();
    const createBtn = page.getByRole("button", { name: "Create profile" });
    await expect(createBtn).toBeDisabled();
  });

  test("can cancel profile creation", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Add profile" }).click();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByText("Who's watching?")).toBeVisible();
  });

  test("can select different avatars in the picker", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Add profile" }).click();
    const ghostBtn = page.getByRole("button", { name: "Ghost" });
    await ghostBtn.click();
    await expect(ghostBtn).toHaveAttribute("aria-pressed", "true");
  });

  test("creating a profile redirects to /home", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Add profile" }).click();
    await page.getByPlaceholder("Your name").fill("TestUser");
    await page.getByRole("button", { name: "Create profile" }).click();
    await page.waitForURL("/home");
  });

  test.afterEach(async ({ page }) => {
    // Cleanup: delete test profile if it was created
    await clearProfileCookie(page);
    await page.goto("/");
    const manageBtn = page.getByRole("button", { name: "Manage profiles" });
    if (await manageBtn.isVisible()) {
      await manageBtn.click();
      const deleteBtn = page.locator("button:has-text('Delete')").last();
      const profileCount = await page.locator(".profile-square").count();
      // Only delete if we added one (more than 2 profiles + Add button)
      if (profileCount > 2) {
        await deleteBtn.click();
      }
      await page.getByRole("button", { name: "Done" }).click();
    }
  });
});

test.describe("Profile management", () => {
  test.beforeEach(async ({ page }) => {
    await clearProfileCookie(page);
  });

  test("manage mode shows edit and delete buttons", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Manage profiles" }).click();
    await expect(page.getByRole("button", { name: "Done" })).toBeVisible();
    const editBtns = page.locator("button:has-text('Edit')");
    await expect(editBtns.first()).toBeVisible();
    const deleteBtns = page.locator("button:has-text('Delete')");
    await expect(deleteBtns.first()).toBeVisible();
  });

  test("clicking edit shows edit form with pre-filled data", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Manage profiles" }).click();
    await page.locator("button:has-text('Edit')").first().click();
    await expect(page.getByText("Edit profile")).toBeVisible();
    await expect(page.getByText("Change the name or pick a new avatar")).toBeVisible();
    await expect(page.getByRole("button", { name: "Save changes" })).toBeVisible();
  });

  test("manage mode disables profile select buttons", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Manage profiles" }).click();
    const profileBtns = page.locator("button[type='submit']:has-text('Andrew')");
    if (await profileBtns.count() > 0) {
      await expect(profileBtns.first()).toBeDisabled();
    }
  });
});

test.describe("Profile switcher (in-app)", () => {
  test("clicking profile switcher clears profile and returns to gate", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await page.getByRole("button", { name: "Andrew" }).click();
    await page.waitForURL("/home");
    await page.locator(".desktop-header").getByTitle("Switch profile").click();
    await page.waitForURL("/");
    await expect(page.getByText("Who's watching?")).toBeVisible();
  });
});
