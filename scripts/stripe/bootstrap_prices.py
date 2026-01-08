#!/usr/bin/env python3
import json
import os
import sys
import urllib.parse
import urllib.request

STRIPE_API = "https://api.stripe.com/v1"
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")

ENV_PATH = os.getenv("ENV_PATH", "/opt/marketing/.env.prod")

PLAN_DEFS = [
    {
        "key": "marketing_launch_monthly",
        "name": "Marketing Launch (Monthly)",
        "amount": 75000,
        "interval": "month",
        "env_var": "NEXT_PUBLIC_STRIPE_MARKETING_LAUNCH_MONTHLY_PRICE_ID",
    },
    {
        "key": "marketing_momentum_monthly",
        "name": "Marketing Momentum (Monthly)",
        "amount": 150000,
        "interval": "month",
        "env_var": "NEXT_PUBLIC_STRIPE_MARKETING_MOMENTUM_MONTHLY_PRICE_ID",
    },
    {
        "key": "marketing_scale_monthly",
        "name": "Marketing Scale (Monthly)",
        "amount": 300000,
        "interval": "month",
        "env_var": "NEXT_PUBLIC_STRIPE_MARKETING_SCALE_MONTHLY_PRICE_ID",
    },
    {
        "key": "web_design_starter_rental_monthly",
        "name": "Web Design Starter Rental (Monthly)",
        "amount": 14900,
        "interval": "month",
        "env_var": "NEXT_PUBLIC_STRIPE_WEB_DESIGN_STARTER_RENTAL_MONTHLY_PRICE_ID",
    },
    {
        "key": "web_design_starter_rental_annual",
        "name": "Web Design Starter Rental (Annual)",
        "amount": 148800,
        "interval": "year",
        "env_var": "NEXT_PUBLIC_STRIPE_WEB_DESIGN_STARTER_RENTAL_ANNUAL_PRICE_ID",
    },
    {
        "key": "web_design_growth_rental_monthly",
        "name": "Web Design Growth Rental (Monthly)",
        "amount": 29900,
        "interval": "month",
        "env_var": "NEXT_PUBLIC_STRIPE_WEB_DESIGN_GROWTH_RENTAL_MONTHLY_PRICE_ID",
    },
    {
        "key": "web_design_growth_rental_annual",
        "name": "Web Design Growth Rental (Annual)",
        "amount": 299000,
        "interval": "year",
        "env_var": "NEXT_PUBLIC_STRIPE_WEB_DESIGN_GROWTH_RENTAL_ANNUAL_PRICE_ID",
    },
    {
        "key": "web_design_storefront_rental_monthly",
        "name": "Web Design Storefront Rental (Monthly)",
        "amount": 49900,
        "interval": "month",
        "env_var": "NEXT_PUBLIC_STRIPE_WEB_DESIGN_STOREFRONT_RENTAL_MONTHLY_PRICE_ID",
    },
    {
        "key": "web_design_storefront_rental_annual",
        "name": "Web Design Storefront Rental (Annual)",
        "amount": 499000,
        "interval": "year",
        "env_var": "NEXT_PUBLIC_STRIPE_WEB_DESIGN_STOREFRONT_RENTAL_ANNUAL_PRICE_ID",
    },
    {
        "key": "web_design_premium_build",
        "name": "Web Design Premium Build (One-time)",
        "amount": 180000,
        "interval": None,
        "env_var": "NEXT_PUBLIC_STRIPE_WEB_DESIGN_PREMIUM_BUILD_PRICE_ID",
    },
    {
        "key": "web_design_flagship_build",
        "name": "Web Design Flagship Build (One-time)",
        "amount": 350000,
        "interval": None,
        "env_var": "NEXT_PUBLIC_STRIPE_WEB_DESIGN_FLAGSHIP_BUILD_PRICE_ID",
    },
]


def request(method: str, path: str, data: dict | None = None) -> dict:
    if not STRIPE_SECRET_KEY:
        raise RuntimeError("STRIPE_SECRET_KEY is not set.")
    url = f"{STRIPE_API}{path}"
    headers = {"Authorization": f"Bearer {STRIPE_SECRET_KEY}"}
    payload = None
    if data is not None:
        payload = urllib.parse.urlencode(data, doseq=True).encode()
        headers["Content-Type"] = "application/x-www-form-urlencoded"
    req = urllib.request.Request(url, data=payload, headers=headers, method=method)
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode("utf-8"))


def search_single(path: str, query: str) -> dict | None:
    params = urllib.parse.urlencode({"query": query})
    result = request("GET", f"{path}/search?{params}")
    data = result.get("data", [])
    return data[0] if data else None


def ensure_product(plan_key: str, name: str) -> dict:
    product = search_single("/products", f"metadata['plan_key']:'{plan_key}'")
    if product:
        return product
    return request(
        "POST",
        "/products",
        {
            "name": name,
            "metadata[plan_key]": plan_key,
        },
    )


def ensure_price(plan_key: str, product_id: str, amount: int, interval: str | None) -> dict:
    price = search_single("/prices", f"metadata['plan_key']:'{plan_key}'")
    if price:
        return price
    payload = {
        "product": product_id,
        "currency": "usd",
        "unit_amount": amount,
        "metadata[plan_key]": plan_key,
    }
    if interval:
        payload["recurring[interval]"] = interval
    return request("POST", "/prices", payload)


def update_env_file(path: str, updates: dict) -> None:
    if not os.path.exists(path):
        raise FileNotFoundError(f"Env file not found: {path}")
    with open(path, "r", encoding="utf-8") as handle:
        lines = handle.readlines()
    existing = {line.split("=", 1)[0]: i for i, line in enumerate(lines) if "=" in line}
    for key, value in updates.items():
        line = f"{key}={value}\n"
        if key in existing:
            lines[existing[key]] = line
        else:
            lines.append(line)
    with open(path, "w", encoding="utf-8") as handle:
        handle.writelines(lines)


def main() -> int:
    if not STRIPE_SECRET_KEY:
        print("STRIPE_SECRET_KEY is not set.")
        return 1

    updates: dict[str, str] = {}
    for plan in PLAN_DEFS:
        product = ensure_product(plan["key"], plan["name"])
        price = ensure_price(plan["key"], product["id"], plan["amount"], plan["interval"])
        updates[plan["env_var"]] = price["id"]
        print(f"{plan['env_var']}={price['id']}")

    update_env_file(ENV_PATH, updates)
    print(f"Updated {ENV_PATH}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
