import "dotenv/config";
import crypto from "crypto";
import express from "express";
import cookie from "cookie";

const app = express();
const port = Number(process.env.OAUTH_PORT || 9999);
const clientId = process.env.GITHUB_CLIENT_ID || "";
const clientSecret = process.env.GITHUB_CLIENT_SECRET || "";
const origin = process.env.OAUTH_ORIGIN || "https://carolinagrowth.co";

function buildState() {
  return crypto.randomBytes(16).toString("hex");
}

app.get("/auth", (req, res) => {
  const provider = req.query.provider || "github";
  if (provider !== "github") {
    return res.status(400).send("Unsupported provider");
  }
  if (!clientId || !clientSecret) {
    return res.status(500).send("Missing GitHub OAuth credentials");
  }

  const state = buildState();
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("oauth_state", state, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 300,
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
  return res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
});

app.get("/auth/callback", async (req, res) => {
  const code = req.query.code;
  const state = req.query.state;
  const cookies = cookie.parse(req.headers.cookie || "");
  const expectedState = cookies.oauth_state;

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
      window.opener.postMessage(payload, '${origin}');
      window.close();
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
