import { test, expect } from "@playwright/test";

test("home page loads key sections", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "The marketing engine that makes local brands feel global.",
    })
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Built for every stage of growth." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Proof of momentum." })).toBeVisible();
});

test("roi calculator updates estimates", async ({ page }) => {
  await page.goto("/roi-calculator");

  const liftField = page.getByLabel("Expected conversion lift (%)");
  await liftField.fill("30");

  await expect(page.getByText(/annual upside/i)).toBeVisible();
});

test("conversion teardown page loads", async ({ page }) => {
  await page.goto("/conversion-teardown");

  await expect(
    page.getByRole("heading", {
      name: "A teardown that finds the conversion leaks your team can fix this month.",
    })
  ).toBeVisible();
});

test("lead routing page loads", async ({ page }) => {
  await page.goto("/lead-routing");

  await expect(
    page.getByRole("heading", {
      name: "Stop losing leads and fix routing in days, not quarters.",
    })
  ).toBeVisible();
});

test("revenue forecast page loads", async ({ page }) => {
  await page.goto("/revenue-forecast");

  await expect(
    page.getByRole("heading", {
      name: "A revenue snapshot your leadership team can trust.",
    })
  ).toBeVisible();
});

test("paid media audit page loads", async ({ page }) => {
  await page.goto("/paid-media-audit");

  await expect(
    page.getByRole("heading", {
      name: "Fix paid media waste and refresh creative fast.",
    })
  ).toBeVisible();
});

test("local SEO page loads", async ({ page }) => {
  await page.goto("/local-seo");

  await expect(
    page.getByRole("heading", {
      name: "Own the map pack with a local authority stack.",
    })
  ).toBeVisible();
});

test("email nurture page loads", async ({ page }) => {
  await page.goto("/email-nurture");

  await expect(
    page.getByRole("heading", {
      name: "Turn inbound leads into booked calls with lifecycle nurture.",
    })
  ).toBeVisible();
});

test("retention referral page loads", async ({ page }) => {
  await page.goto("/retention-referral");

  await expect(
    page.getByRole("heading", {
      name: "Turn retention into your most predictable growth channel.",
    })
  ).toBeVisible();
});

test("best-fit quiz page loads", async ({ page }) => {
  await page.goto("/best-fit-quiz");

  await expect(
    page.getByRole("heading", {
      name: "Get matched to the right growth plan in 60 seconds.",
    })
  ).toBeVisible();
});

test("proposal wizard page loads", async ({ page }) => {
  await page.goto("/proposal-wizard");

  await expect(
    page.getByRole("heading", {
      name: "Build a tailored proposal range in minutes.",
    })
  ).toBeVisible();
});

test("utm builder page loads", async ({ page }) => {
  await page.goto("/utm-builder");

  await expect(
    page.getByRole("heading", {
      name: "Build clean UTMs and QR codes in seconds.",
    })
  ).toBeVisible();
});

test("landing templates page loads", async ({ page }) => {
  await page.goto("/landing-templates");

  await expect(
    page.getByRole("heading", {
      name: "Pick a landing page template built to convert.",
    })
  ).toBeVisible();
});

test("pricing builder page loads", async ({ page }) => {
  await page.goto("/pricing-builder");

  await expect(
    page.getByRole("heading", {
      name: "Build the right package and budget range for your growth plan.",
    })
  ).toBeVisible();
});

test("growth sprint form submits", async ({ page }) => {
  await page.goto("/growth-sprint");

  await page.getByLabel("Full name", { exact: true }).fill("E2E Tester");
  await page
    .getByLabel("Email", { exact: true })
    .fill(`e2e-${Date.now()}@example.com`);
  await page.getByLabel("Company", { exact: true }).fill("Test Company");
  await page.getByLabel("Website", { exact: true }).fill("https://example.com");
  await page.getByLabel("Target start date", { exact: true }).fill("Next month");
  await page.getByLabel("Team size", { exact: true }).fill("5");
  await page.getByLabel("Monthly growth budget", { exact: true }).fill("$10,000");
  await page
    .getByLabel("Primary outcome for the sprint", { exact: true })
    .fill("Increase qualified leads");
  await page
    .getByLabel("Biggest growth constraint right now", { exact: true })
    .fill("Limited inbound volume");
  await page.getByLabel("Channel focus (SEO, paid, email, etc.)").fill("SEO + Paid");

  await page.getByRole("button", { name: "Request the sprint plan" }).scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Request the sprint plan" }).click();

  await expect(page.getByTestId("growth-sprint-form")).toHaveAttribute(
    "data-status",
    "success",
    { timeout: 20_000 }
  );
  await expect(page.getByTestId("growth-sprint-message")).toContainText("Thanks!");
});

test("portfolio slider loads", async ({ page }) => {
  await page.goto("/portfolio");

  await expect(
    page.getByRole("heading", { name: "Interactive case study slider" })
  ).toBeVisible();
});
