# Secrets Management (SOPS + age)

We store secrets in an encrypted file and keep the private key only on the VPS.
This makes it easy to rotate secrets without exposing them in git.

## Paths (non-standard)
- **Private key (VPS only):** `/opt/marketing/private/age/keys.txt`
- **Encrypted secrets (repo):** `secrets/.env.prod.enc`
- **Decrypted secrets (VPS runtime):** `/opt/marketing/.env.prod`

## One-time setup
1) Install tools on the VPS:
```
apt-get update -y
apt-get install -y age
curl -sSL -o /usr/local/bin/sops https://github.com/getsops/sops/releases/download/v3.8.1/sops-v3.8.1.linux.amd64
chmod +x /usr/local/bin/sops
```

2) Generate the age key (VPS only):
```
mkdir -p /opt/marketing/private/age
chmod 700 /opt/marketing/private/age
age-keygen -o /opt/marketing/private/age/keys.txt
chmod 600 /opt/marketing/private/age/keys.txt
```
Copy the **public key** into `.sops.yaml`.

## Rotation workflow (how the scripts work)

**Step 1: Decrypt for editing**
```
scripts/secrets/rotate.sh
```
This decrypts `secrets/.env.prod.enc` → `secrets/.env.prod` so you can edit it.

**Step 2: Edit**
Update `secrets/.env.prod` with new values.

**Step 3: Re-encrypt**
```
scripts/secrets/encrypt.sh
```
This overwrites `secrets/.env.prod.enc` with the new encrypted version and removes
the plaintext file by default.

**Step 4: Deploy secrets**
```
scripts/secrets/deploy.sh
```
This decrypts on the server using the VPS key and writes `/opt/marketing/.env.prod`.
Restart services afterward:
```
docker compose -f /opt/marketing/docker-compose.prod.yml --env-file /opt/marketing/.env.prod up -d --build
```

## Notes
- The plaintext file `secrets/.env.prod` is ignored by git.
- The encrypted file `secrets/.env.prod.enc` is safe to commit.
- You can override paths with:
  - `SOPS_AGE_KEY_FILE`
  - `PLAINTEXT_PATH`
  - `ENCRYPTED_PATH`
  - `DEPLOY_PATH`
