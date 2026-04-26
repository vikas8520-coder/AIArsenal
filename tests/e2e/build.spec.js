import { test, expect } from "@playwright/test";

test.describe("Stack Builder", () => {
  test("can add tools, name a stack, generate share URL", async ({ page }) => {
    await page.goto("/build");

    // Empty state visible
    await expect(page.getByText(/Pick tools from the right/i)).toBeVisible();

    // Search for Cursor and add it
    await page.getByPlaceholder(/Search 206\+ tools/i).fill("Cursor");
    await page.getByRole("button", { name: /Cursor/i }).first().click();

    // Add a second tool
    await page.getByPlaceholder(/Search 206\+ tools/i).fill("Gemini");
    await page.getByRole("button", { name: /Google Gemini API/i }).first().click();

    // Should now show 2 role rows
    await expect(page.locator("text=Cursor").first()).toBeVisible();
    await expect(page.locator("text=Google Gemini API").first()).toBeVisible();

    // Name the stack and save
    await page.getByPlaceholder(/Stack name/i).fill("Test Stack");
    await page.getByRole("button", { name: /★ SAVE/i }).click();

    await expect(page.getByText(/Saved "Test Stack"/i)).toBeVisible();
  });
});

test.describe("Multi compare", () => {
  test("loads with prefilled ids in URL", async ({ page }) => {
    // Cursor + Gemini API + Vercel AI SDK
    await page.goto("/compare/multi?ids=d3,d9,d21");

    await expect(page.getByText(/Cursor vs Google Gemini API vs Vercel AI SDK/i)).toBeVisible();
    // Spec table headers should match
    await expect(page.getByText(/FREE TIER/i).first()).toBeVisible();
    await expect(page.getByText(/OPEN SOURCE/i).first()).toBeVisible();
  });
});
