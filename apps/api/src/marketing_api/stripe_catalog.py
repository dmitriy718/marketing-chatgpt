from dataclasses import dataclass

from marketing_api.settings import settings


@dataclass(frozen=True)
class StripePlan:
    key: str
    label: str
    mode: str
    amount: int
    price_id: str | None


def _plan(
    *,
    key: str,
    label: str,
    mode: str,
    amount: int,
    price_id: str | None,
) -> StripePlan:
    return StripePlan(
        key=key,
        label=label,
        mode=mode,
        amount=amount,
        price_id=price_id,
    )


STRIPE_PLANS: dict[str, StripePlan] = {
    "marketing_launch_monthly": _plan(
        key="marketing_launch_monthly",
        label="Marketing Launch (Monthly)",
        mode="subscription",
        amount=75000,
        price_id=settings.stripe_marketing_launch_monthly_price_id,
    ),
    "marketing_momentum_monthly": _plan(
        key="marketing_momentum_monthly",
        label="Marketing Momentum (Monthly)",
        mode="subscription",
        amount=150000,
        price_id=settings.stripe_marketing_momentum_monthly_price_id,
    ),
    "marketing_scale_monthly": _plan(
        key="marketing_scale_monthly",
        label="Marketing Scale (Monthly)",
        mode="subscription",
        amount=300000,
        price_id=settings.stripe_marketing_scale_monthly_price_id,
    ),
    "web_design_starter_rental_monthly": _plan(
        key="web_design_starter_rental_monthly",
        label="Web Design Starter Rental (Monthly)",
        mode="subscription",
        amount=14900,
        price_id=settings.stripe_web_design_starter_rental_monthly_price_id,
    ),
    "web_design_starter_rental_annual": _plan(
        key="web_design_starter_rental_annual",
        label="Web Design Starter Rental (Annual)",
        mode="subscription",
        amount=148800,
        price_id=settings.stripe_web_design_starter_rental_annual_price_id,
    ),
    "web_design_growth_rental_monthly": _plan(
        key="web_design_growth_rental_monthly",
        label="Web Design Growth Rental (Monthly)",
        mode="subscription",
        amount=29900,
        price_id=settings.stripe_web_design_growth_rental_monthly_price_id,
    ),
    "web_design_growth_rental_annual": _plan(
        key="web_design_growth_rental_annual",
        label="Web Design Growth Rental (Annual)",
        mode="subscription",
        amount=299000,
        price_id=settings.stripe_web_design_growth_rental_annual_price_id,
    ),
    "web_design_storefront_rental_monthly": _plan(
        key="web_design_storefront_rental_monthly",
        label="Web Design Storefront Rental (Monthly)",
        mode="subscription",
        amount=49900,
        price_id=settings.stripe_web_design_storefront_rental_monthly_price_id,
    ),
    "web_design_storefront_rental_annual": _plan(
        key="web_design_storefront_rental_annual",
        label="Web Design Storefront Rental (Annual)",
        mode="subscription",
        amount=499000,
        price_id=settings.stripe_web_design_storefront_rental_annual_price_id,
    ),
    "web_design_premium_build": _plan(
        key="web_design_premium_build",
        label="Web Design Premium Build (One-time)",
        mode="one_time",
        amount=180000,
        price_id=settings.stripe_web_design_premium_build_price_id,
    ),
    "web_design_flagship_build": _plan(
        key="web_design_flagship_build",
        label="Web Design Flagship Build (One-time)",
        mode="one_time",
        amount=350000,
        price_id=settings.stripe_web_design_flagship_build_price_id,
    ),
}


def get_plan(plan_key: str) -> StripePlan | None:
    return STRIPE_PLANS.get(plan_key)


def get_pricing_builder_estimate(
    *, tier: str, locations: str, urgency: str, support: str
) -> tuple[str, int]:
    tier_pricing = {
        "starter": ("Starter", 6500),
        "growth": ("Growth", 11000),
        "scale": ("Scale", 18000),
    }
    location_multiplier = {
        "single": 1,
        "multi": 1.35,
        "enterprise": 1.7,
    }
    urgency_multiplier = {
        "standard": 1,
        "fast": 1.15,
        "rush": 1.3,
    }
    support_multiplier = {
        "standard": 1,
        "premium": 1.2,
        "enterprise": 1.35,
    }

    tier_label, base = tier_pricing.get(tier, tier_pricing["growth"])
    multiplier = (
        location_multiplier.get(locations, 1)
        * urgency_multiplier.get(urgency, 1)
        * support_multiplier.get(support, 1)
    )
    monthly = round(base * multiplier)
    return tier_label, monthly
