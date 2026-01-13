import ipaddress
import socket
from urllib.parse import urljoin, urlparse

from fastapi import HTTPException
import httpx

BLOCKED_HOST_SUFFIXES = (".local", ".localhost")
ALLOWED_SCHEMES = ("http", "https")


def _is_blocked_ip(ip: ipaddress._BaseAddress) -> bool:
    return any(
        [
            ip.is_private,
            ip.is_loopback,
            ip.is_link_local,
            ip.is_multicast,
            ip.is_reserved,
            ip.is_unspecified,
        ]
    )


def validate_external_url(raw_url: str) -> str:
    try:
        parsed = urlparse(raw_url)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid URL.") from exc

    if parsed.scheme not in ALLOWED_SCHEMES:
        raise HTTPException(status_code=400, detail="Invalid URL scheme.")

    if not parsed.hostname:
        raise HTTPException(status_code=400, detail="Invalid URL host.")

    hostname = parsed.hostname.lower()
    if hostname == "localhost" or hostname.endswith(BLOCKED_HOST_SUFFIXES):
        raise HTTPException(status_code=400, detail="Invalid URL host.")

    try:
        ip = ipaddress.ip_address(hostname)
        if _is_blocked_ip(ip):
            raise HTTPException(status_code=400, detail="Invalid URL host.")
        return raw_url
    except ValueError:
        pass

    timeout = socket.getdefaulttimeout()
    socket.setdefaulttimeout(2)
    try:
        addr_info = socket.getaddrinfo(hostname, parsed.port or 80)
    except socket.gaierror as exc:
        raise HTTPException(status_code=400, detail="Unable to resolve URL host.") from exc
    finally:
        socket.setdefaulttimeout(timeout)

    resolved_ips = {ipaddress.ip_address(item[4][0]) for item in addr_info}
    if any(_is_blocked_ip(ip) for ip in resolved_ips):
        raise HTTPException(status_code=400, detail="Invalid URL host.")

    return raw_url


async def fetch_validated_html(
    url: str,
    *,
    user_agent: str,
    timeout: float = 10.0,
    max_redirects: int = 3,
) -> tuple[str, int]:
    current_url = validate_external_url(url)
    async with httpx.AsyncClient(timeout=timeout, follow_redirects=False) as client:
        for _ in range(max_redirects + 1):
            response = await client.get(current_url, headers={"User-Agent": user_agent})
            if response.is_redirect and response.headers.get("location"):
                next_url = urljoin(current_url, response.headers["location"])
                current_url = validate_external_url(next_url)
                continue
            return response.text, response.status_code
    raise HTTPException(status_code=400, detail="Too many redirects.")
