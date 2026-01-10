import "dotenv/config";
import crypto from "crypto";
import express from "express";
import cookie from "cookie";

const app = express();
const port = Number(process.env.OAUTH_PORT || 9999);
const clientId = process.env.GITHUB_CLIENT_ID || "";
const clientSecret = process.env.GITHUB_CLIENT_SECRET || "";
const defaultOrigin = process.env.OAUTH_ORIGIN || "https://carolinagrowth.co";
const allowedOrigins = (process.env.OAUTH_ALLOWED_ORIGINS || defaultOrigin)
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const cookieDomain = process.env.OAUTH_COOKIE_DOMAIN || "";

function isAllowedOrigin(origin) {
  return allowedOrigins.includes(origin);
}

function resolveOrigin(requestedOrigin) {
  if (requestedOrigin && isAllowedOrigin(requestedOrigin)) {
    return requestedOrigin;
  }
  return defaultOrigin;
}

function originFromReferer(referer) {
  if (!referer) {
    return "";
  }
  try {
    return new URL(referer).origin;
  } catch (error) {
    return "";
  }
}

function resolveCookieDomain(origin) {
  if (cookieDomain) {
    return cookieDomain;
  }
  try {
    const hostname = new URL(origin).hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "";
    }
    const parts = hostname.split(".");
    if (parts.length >= 2) {
      return `.${parts.slice(-2).join(".")}`;
    }
  } catch (error) {
    return "";
  }
  return "";
}

function buildState() {
  return crypto.randomBytes(16).toString("hex");
}

app.get("/auth", (req, res) => {
  const provider = req.query.provider || "github";
  const requestedOrigin = req.query.origin;
  const refererOrigin = originFromReferer(req.get("referer"));
  const originOverride = requestedOrigin || refererOrigin;
  if (provider !== "github") {
    return res.status(400).send("Unsupported provider");
  }
  if (originOverride && !isAllowedOrigin(originOverride)) {
    return res.status(400).send("Unsupported origin");
  }
  if (!clientId || !clientSecret) {
    return res.status(500).send("Missing GitHub OAuth credentials");
  }

  const state = buildState();
  const origin = resolveOrigin(originOverride);
  const domain = resolveCookieDomain(origin);
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("oauth_state", state, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 300,
      ...(domain ? { domain } : {}),
    })
  );
  res.append(
    "Set-Cookie",
    cookie.serialize("oauth_origin", origin, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 300,
      ...(domain ? { domain } : {}),
    })
  );

  const redirectUri = `${origin}/auth/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "repo",
    state,
    allow_signup: "true",
  });
  const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;

  res.setHeader("Content-Type", "text/html");
  return res.send(`<!doctype html>
<html lang="en">
  <head><meta charset="utf-8" /></head>
  <body>
    <script>
      const payload = 'authorizing:github';
      const targetOrigin = '${origin}';
      try {
        if (window.opener) {
          window.opener.postMessage(payload, targetOrigin);
        }
      } catch (error) {
        // Ignore postMessage failures; redirect still proceeds.
      }
      window.location.href = '${authUrl}';
    </script>
    <noscript>
      <a href="${authUrl}">Continue to GitHub</a>
    </noscript>
  </body>
</html>`);
});

app.get("/auth/callback", async (req, res) => {
  const code = req.query.code;
  const state = req.query.state;
  const cookies = cookie.parse(req.headers.cookie || "");
  const expectedState = cookies.oauth_state;
  const origin = resolveOrigin(cookies.oauth_origin);

  if (!code || !state || state !== expectedState) {
    return res.status(400).send("Invalid OAuth state");
  }

  try {
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: `${origin}/auth/callback`,
        state,
      }),
    });

    const payload = await tokenResponse.json();
    if (!payload.access_token) {
      return res.status(400).send("Failed to obtain access token");
    }

    const message = {
      token: payload.access_token,
      provider: "github",
    };

    res.setHeader("Content-Type", "text/html");
    res.send(`<!doctype html>
<html lang="en">
  <head><meta charset="utf-8" /></head>
  <body>
    <script>
      const message = ${JSON.stringify(message)};
      const payload = 'authorization:github:success:' + JSON.stringify(message);
      const targetOrigin = '${origin}';
      const storageKey = 'decap_oauth';
      let sent = false;

      try {
        localStorage.setItem(storageKey, payload);
      } catch (error) {
        // Ignore storage failures; postMessage is still attempted.
      }

      try {
        if (window.opener) {
          window.opener.postMessage(payload, targetOrigin);
          sent = true;
        }
      } catch (error) {
        sent = false;
      }

      if (sent) {
        window.close();
      } else {
        window.location.href = targetOrigin + '/admin/';
      }
    </script>
  </body>
</html>`);
  } catch (error) {
    res.status(500).send("OAuth error");
  }
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`[oauth] listening on ${port}`);
});
