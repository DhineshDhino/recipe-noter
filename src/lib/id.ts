/**
 * Generates a unique ID string using crypto.randomUUID when available,
 * falling back to a random base-36 string for older environments.
 */
export const generateId = (): string =>
  crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 11);
