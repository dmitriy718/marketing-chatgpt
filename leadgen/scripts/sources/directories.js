import { logInfo } from "../../utils/logger.js";

export async function collectDirectories() {
  logInfo("Directory scraping disabled by default. Use official APIs only.");
  return [];
}
