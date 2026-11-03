declare const __ENV: Record<string, string | undefined>;
export const TARGET_URL = __ENV.TARGET_URL ?? "http://localhost:4321/";
