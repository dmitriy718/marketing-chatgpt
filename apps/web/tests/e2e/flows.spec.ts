import { test, expect } from "@playwright/test";

test("best-fit quiz completes and submits", async ({ page }) => {
  await page.goto("/best-fit-quiz");

  await page.getByRole("button", { name: "Growth plateau" }).click();
  await page.getByRole("button", { name: "Higher conversion rate" }).click();
  await page.getByRole("button", { name: "Paid media" }).click();

  await page.getByLabel("Full name").fill("Quiz Tester");
  await page.getByLabel("Email").fill(`quiz-${Date.now()}@example.com`);
  await page.getByLabel("Company").fill("Quiz Co");
  await page.getByLabel("Monthly growth budget").fill("$12,000");

  await page.getByRole("button", { name: "Email my best-fit plan" }).click();

  await expect(
    page.getByText("Thanks! We will send the best-fit plan shortly.")
  ).toBeVisible();
});

test("proposal wizard submits", async ({ page }) => {
  await page.goto("/proposal-wizard");

  await page.getByRole("button", { name: "Conversion optimization" }).click();
  await page.getByRole("button", { name: "14 days" }).click();

  await page.getByLabel("Full name").fill("Proposal Tester");
  await page.getByLabel("Email").fill(`proposal-${Date.now()}@example.com`);
  await page.getByLabel("Company").fill("Proposal Co");
  await page.getByLabel("Monthly growth budget").fill("$18,000");

  await page.getByRole("button", { name: "Send my proposal" }).click();

  await expect(
    page.getByText("Thanks! We will send a tailored proposal within 48 hours.")
  ).toBeVisible();
});

test("pricing builder submits", async ({ page }) => {
  await page.goto("/pricing-builder");

  await page.getByRole("button", { name: "Scale" }).click();
  await page.getByRole("button", { name: "Multi-location" }).click();
  await page.getByRole("button", { name: "Premium" }).click();

  await page.getByLabel("Full name").fill("Pricing Tester");
  await page.getByLabel("Email").fill(`pricing-${Date.now()}@example.com`);
  await page.getByLabel("Company").fill("Pricing Co");
  await page.getByLabel("Monthly growth budget").fill("$25,000");

  await page.getByRole("button", { name: "Send my package" }).click();

  await expect(
    page.getByText("Thanks! We will send a package recommendation within 48 hours.")
  ).toBeVisible();
});

test("utm builder generates a link and QR", async ({ page }) => {
  await page.goto("/utm-builder");

  await page.getByLabel("Destination URL").fill("example.com/landing");
  await page.getByLabel("UTM campaign").fill("spring-launch");

  await expect(page.getByText(/utm_source=newsletter/)).toBeVisible();
  await expect(page.getByText(/utm_campaign=spring-launch/)).toBeVisible();
  await expect(page.getByAltText("UTM QR code")).toBeVisible();
});
