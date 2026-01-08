export function logInfo(message, details) {
  const payload = details ? ` ${JSON.stringify(details)}` : "";
  console.log(`[leadgen] ${message}${payload}`);
}

export function logError(message, error) {
  const payload = error ? ` ${error.stack ?? error.message ?? error}` : "";
  console.error(`[leadgen] ${message}${payload}`);
}
