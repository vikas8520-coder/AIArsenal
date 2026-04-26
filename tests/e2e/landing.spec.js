import { test, expect } from "@playwright/test";

test.describe("Landing splash", () => {
  test("renders kinetic hero with stats and CTAs", async ({ page }) => {
    await page.goto("/");

    // Splash live status pill
    await expect(page.getByText("AIARSENAL · v2.0 · LIVE")).toBeVisible();

    // CTAs present
    await expect(page.getByRole("link", { name: /TAKE THE QUIZ/i })).toBeVisible();
    await expect(page.getByText(/EXPLORE TOOLS/i).first()).toBeVisible();
  });

  test("EXPLORE TOOLS dismisses splash and reveals directory", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /EXPLORE TOOLS/i }).click();

    // Directory's Header sticky pill should be visible after splash dismiss
    await expect(page.locator("text=AIArsenal").first()).toBeVisible();
  });
});
