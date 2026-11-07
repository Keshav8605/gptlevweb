/**
 * Client authentication and unlock token storage.
 * Stores recipient unlock tokens in sessionStorage scoped per gift (by slug or giftId).
 * Does not trust or write user-editable role or name overrides in localStorage.
 */

export function storeUnlockToken(slug: string, token: string, giftId?: string): void {
  if (typeof window === "undefined") return;
  try {
    if (slug) {
      sessionStorage.setItem(`gift_unlock_${slug}`, token);
    }
    if (giftId) {
      sessionStorage.setItem(`gift_unlock_${giftId}`, token);
    }
    // Also save as default session unlock token fallback
    sessionStorage.setItem("gift_unlock_token", token);
  } catch {
    // Ignore storage quota or disabled storage errors
  }
}

export function getStoredUnlockToken(identifier?: string | null): string | null {
  if (typeof window === "undefined" || !identifier) return null;
  try {
    return (
      sessionStorage.getItem(`gift_unlock_${identifier}`) ||
      sessionStorage.getItem("gift_unlock_token") ||
      null
    );
  } catch {
    return null;
  }
}

export function clearStoredUnlockToken(identifier?: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (identifier) {
      sessionStorage.removeItem(`gift_unlock_${identifier}`);
    }
    sessionStorage.removeItem("gift_unlock_token");
  } catch {
    // Ignore storage errors
  }
}

export function getUnlockHeaders(identifier?: string | null): Record<string, string> {
  const token = getStoredUnlockToken(identifier);
  if (!token) return {};
  return {
    "x-gift-unlock-token": token,
  };
}

