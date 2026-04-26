import { test, expect } from "@playwright/test";

const ANSWERS = [
  /Ship an AI product/i,
  /Solo developer/i,
  /Under \$50/i,
  /Full-stack dev/i,
  /Cloud is fine/i,
];

test.describe("Stack Quiz happy path", () => {
  test("intro → 5 questions → result page", async ({ page }) => {
    await page.goto("/quiz");

    // Intro
    await expect(page.getByText(/Find your AI stack/i)).toBeVisible();
    await page.getByRole("button", { name: /^START/i }).click();

    // Click through each question
    for (const answer of ANSWERS) {
      await expect(page.getByText(/Question \d of 5/i)).toBeVisible({
        timeout: 10_000,
      });
      await page.getByRole("button", { name: answer }).first().click();
    }

    // Wait for the assembling phase, then result page redirect
    await page.waitForURL(/\/quiz\/result\?/, { timeout: 30_000 });

    // Story mode should fire on the result page first
    await expect(page.getByText(/ARCHETYPE LOCKED|YOU ARE/i).first()).toBeVisible(
      { timeout: 15_000 }
    );
  });

  test("/quiz/result with invalid s= shows fallback", async ({ page }) => {
    await page.goto("/quiz/result?s=garbage");
    await expect(page.getByText(/Result not found/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /RETAKE QUIZ/i })).toBeVisible();
  });
});
