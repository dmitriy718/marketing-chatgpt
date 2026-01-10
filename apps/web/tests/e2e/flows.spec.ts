import { expect, test } from "@playwright/test";

const testEmail = process.env.E2E_TEST_EMAIL || "qa@carolinagrowth.co";
const internalToken = process.env.INTERNAL_API_TOKEN?.trim();
const baseUrl =
  process.env.PLAYWRIGHT_BASE_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  "http://localhost:3001";
const cookieDomain = new URL(baseUrl).hostname;

async function setupLeadSubmission(page) {
  await page.addInitScript((token) => {
    window.turnstile = {
      render: (_element, options) => {
        const fallbackToken = "e2e-turnstile-token";
        setTimeout(() => options.callback(token ?? fallbackToken), 0);
        return "e2e-turnstile-widget";
      },
    };
  }, internalToken ?? null);

  if (internalToken) {
    await page.addInitScript((token) => {
      (window as Window & { __internalApiToken?: string }).__internalApiToken = token;
    }, internalToken);
    await page.setExtraHTTPHeaders({ "x-internal-token": internalToken });
    await page.context().addCookies([
      {
        name: "cg_internal",
        value: internalToken,
        domain: cookieDomain,
        path: "/",
      },
    ]);
  }
}

test("proposal wizard submits", async ({ page }) => {
  await setupLeadSubmission(page);
  await page.goto("/proposal-wizard");

  await page.getByRole("button", { name: "Conversion optimization" }).click();
  await page.getByRole("button", { name: "14 days" }).click();

  await page.getByLabel("Full name").fill("Proposal Tester");
  await page.getByLabel("Email").fill(testEmail);
  await page.getByLabel("Company").fill("Proposal Co");
  await page.getByLabel("Monthly growth budget").fill("$18,000");

  await page.getByRole("button", { name: "Send my proposal" }).click();

  await expect(
    page.getByText("Thanks! We will send a tailored proposal within 48 hours.")
  ).toBeVisible();
});

test("pricing builder submits", async ({ page }) => {
  await setupLeadSubmission(page);
  await page.goto("/pricing");

  await page.getByRole("button", { name: "Scale" }).click();
  await page.getByRole("button", { name: "Multi-location" }).click();
  await page.getByRole("button", { name: "Premium" }).click();

  await page.getByLabel("Full name").fill("Pricing Tester");
  await page.getByLabel("Email").fill(testEmail);
  await page.getByLabel("Company").fill("Pricing Co");
  await page.getByLabel("Monthly growth budget").fill("$25,000");

  await page.getByRole("button", { name: "Send my package" }).click();

  await expect(
    page.getByText(
      "Thanks! Your deposit invoice is on the way. We will follow up within 48 hours."
    )
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
