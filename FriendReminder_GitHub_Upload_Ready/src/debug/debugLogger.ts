const enabled = __DEV__;

export const debugLogger = {
  info(scope: string, message: string, data?: unknown) {
    if (enabled) console.log(`[FriendReminder:${scope}] ${message}`, data ?? "");
  },
  warn(scope: string, message: string, data?: unknown) {
    if (enabled) console.warn(`[FriendReminder:${scope}] ${message}`, data ?? "");
  },
  error(scope: string, message: string, error?: unknown) {
    if (enabled) console.error(`[FriendReminder:${scope}] ${message}`, error ?? "");
  }
};
