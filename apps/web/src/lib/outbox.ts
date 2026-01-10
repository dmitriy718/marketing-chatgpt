import { promises as fs } from "node:fs";
import path from "node:path";

export type OutboxEntry<T> = {
  id: string;
  type: string;
  payload: T;
  attempts: number;
  lastAttemptedAt: string;
};

const DEFAULT_OUTBOX_PATH = path.join(process.cwd(), "data", "outbox.json");

function getOutboxPath() {
  return process.env.LEAD_OUTBOX_PATH || DEFAULT_OUTBOX_PATH;
}

async function ensureOutbox() {
  const outboxPath = getOutboxPath();
  await fs.mkdir(path.dirname(outboxPath), { recursive: true });
  try {
    await fs.access(outboxPath);
  } catch {
    await fs.writeFile(outboxPath, "[]", "utf8");
  }
  return outboxPath;
}

async function acquireLock(lockPath: string) {
  const maxAttempts = 40;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      return await fs.open(lockPath, "wx");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
        throw error;
      }
      await new Promise((resolve) =>
        setTimeout(resolve, Math.min(200, 25 + attempt * 10))
      );
    }
  }
  throw new Error("Outbox lock timeout.");
}

async function withOutboxLock<T>(work: (outboxPath: string) => Promise<T>) {
  const outboxPath = await ensureOutbox();
  const lockPath = `${outboxPath}.lock`;
  const handle = await acquireLock(lockPath);
  try {
    return await work(outboxPath);
  } finally {
    await handle.close();
    await fs.unlink(lockPath).catch(() => null);
  }
}

async function readOutboxUnlocked<T>(outboxPath: string) {
  const raw = await fs.readFile(outboxPath, "utf8");
  return JSON.parse(raw) as Array<OutboxEntry<T>>;
}

async function writeOutboxUnlocked<T>(outboxPath: string, entries: Array<OutboxEntry<T>>) {
  await fs.writeFile(outboxPath, JSON.stringify(entries, null, 2), "utf8");
}

export async function appendOutbox<T>(entry: OutboxEntry<T>) {
  await withOutboxLock(async (outboxPath) => {
    const current = await readOutboxUnlocked<T>(outboxPath);
    current.push(entry);
    await writeOutboxUnlocked(outboxPath, current);
  });
}

export async function flushOutbox<T>(handlers: Record<string, (payload: T) => Promise<boolean>>) {
  await withOutboxLock(async (outboxPath) => {
    const entries = await readOutboxUnlocked<T>(outboxPath);
    if (!entries.length) {
      return;
    }

    const remaining: Array<OutboxEntry<T>> = [];
    for (const entry of entries) {
      const handler = handlers[entry.type];
      if (!handler) {
        remaining.push(entry);
        continue;
      }
      try {
        const ok = await handler(entry.payload);
        if (!ok) {
          remaining.push({
            ...entry,
            attempts: entry.attempts + 1,
            lastAttemptedAt: new Date().toISOString(),
          });
        }
      } catch {
        remaining.push({
          ...entry,
          attempts: entry.attempts + 1,
          lastAttemptedAt: new Date().toISOString(),
        });
      }
    }

    if (remaining.length !== entries.length) {
      await writeOutboxUnlocked(outboxPath, remaining);
    }
  });
}
