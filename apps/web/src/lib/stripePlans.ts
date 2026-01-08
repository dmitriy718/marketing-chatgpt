export type StripePlan = {
  key: string;
  label: string;
  priceId: string | null;
  mode: "subscription" | "one_time";
  amount: number;
  interval?: "month" | "year";
};

const env = process.env;

export const stripePlans: Record<string, StripePlan> = {
  marketing_launch_monthly: {
    key: "marketing_launch_monthly",
    label: "Marketing Launch (Monthly)",
    priceId: env.NEXT_PUBLIC_STRIPE_MARKETING_LAUNCH_MONTHLY_PRICE_ID ?? null,
    mode: "subscription",
    amount: 75000,
    interval: "month",
  },
  marketing_momentum_monthly: {
    key: "marketing_momentum_monthly",
    label: "Marketing Momentum (Monthly)",
    priceId: env.NEXT_PUBLIC_STRIPE_MARKETING_MOMENTUM_MONTHLY_PRICE_ID ?? null,
    mode: "subscription",
    amount: 150000,
    interval: "month",
  },
  marketing_scale_monthly: {
    key: "marketing_scale_monthly",
    label: "Marketing Scale (Monthly)",
    priceId: env.NEXT_PUBLIC_STRIPE_MARKETING_SCALE_MONTHLY_PRICE_ID ?? null,
    mode: "subscription",
    amount: 300000,
    interval: "month",
  },
  web_design_starter_rental_monthly: {
    key: "web_design_starter_rental_monthly",
    label: "Web Design Starter Rental (Monthly)",
    priceId: env.NEXT_PUBLIC_STRIPE_WEB_DESIGN_STARTER_RENTAL_MONTHLY_PRICE_ID ?? null,
    mode: "subscription",
    amount: 14900,
    interval: "month",
  },
  web_design_starter_rental_annual: {
    key: "web_design_starter_rental_annual",
    label: "Web Design Starter Rental (Annual)",
    priceId: env.NEXT_PUBLIC_STRIPE_WEB_DESIGN_STARTER_RENTAL_ANNUAL_PRICE_ID ?? null,
    mode: "subscription",
    amount: 148800,
    interval: "year",
  },
  web_design_growth_rental_monthly: {
    key: "web_design_growth_rental_monthly",
    label: "Web Design Growth Rental (Monthly)",
    priceId: env.NEXT_PUBLIC_STRIPE_WEB_DESIGN_GROWTH_RENTAL_MONTHLY_PRICE_ID ?? null,
    mode: "subscription",
    amount: 29900,
    interval: "month",
  },
  web_design_growth_rental_annual: {
    key: "web_design_growth_rental_annual",
    label: "Web Design Growth Rental (Annual)",
    priceId: env.NEXT_PUBLIC_STRIPE_WEB_DESIGN_GROWTH_RENTAL_ANNUAL_PRICE_ID ?? null,
    mode: "subscription",
    amount: 299000,
    interval: "year",
  },
  web_design_storefront_rental_monthly: {
    key: "web_design_storefront_rental_monthly",
    label: "Web Design Storefront Rental (Monthly)",
    priceId: env.NEXT_PUBLIC_STRIPE_WEB_DESIGN_STOREFRONT_RENTAL_MONTHLY_PRICE_ID ?? null,
    mode: "subscription",
    amount: 49900,
    interval: "month",
  },
  web_design_storefront_rental_annual: {
    key: "web_design_storefront_rental_annual",
    label: "Web Design Storefront Rental (Annual)",
    priceId: env.NEXT_PUBLIC_STRIPE_WEB_DESIGN_STOREFRONT_RENTAL_ANNUAL_PRICE_ID ?? null,
    mode: "subscription",
    amount: 499000,
    interval: "year",
  },
  web_design_premium_build: {
    key: "web_design_premium_build",
    label: "Web Design Premium Build (One-time)",
    priceId: env.NEXT_PUBLIC_STRIPE_WEB_DESIGN_PREMIUM_BUILD_PRICE_ID ?? null,
    mode: "one_time",
    amount: 180000,
  },
  web_design_flagship_build: {
    key: "web_design_flagship_build",
    label: "Web Design Flagship Build (One-time)",
    priceId: env.NEXT_PUBLIC_STRIPE_WEB_DESIGN_FLAGSHIP_BUILD_PRICE_ID ?? null,
    mode: "one_time",
    amount: 350000,
  },
};

export function getStripePlan(planKey: string | null) {
  if (!planKey) {
    return null;
  }
  return stripePlans[planKey] ?? null;
}
