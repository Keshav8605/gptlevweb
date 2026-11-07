// Server-side store for Secret World verification, hints, and content.
// Private content is verified on the server and never exposed in client bundles.
// Stored persistently inside gift records in relationship-database.json.

import { loadDatabase, saveDatabase, type GiftRecord } from "./server-db";
import { hashPasscode, verifyPasscode } from "./secrets";

export interface SecretWorldConfig {
  password: string;
  hint: string;
  title: string;
  letter: string;
  photos: string[];
}

// Rate limiting state: IP/Client -> { attempts: number, lockedUntil: number }
interface RateLimitRecord {
  attempts: number;
  lockedUntil: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 30 * 1000; // 30 second cooldown

function resolveGift(key: string): GiftRecord | null {
  const db = loadDatabase();
  if (key && key !== "default") {
    const byId = db.gifts.find((g) => g.id === key);
    if (byId) return byId;
    const bySlug = db.gifts.find((g) => g.slug === key);
    if (bySlug) return bySlug;
    const byCreator = db.gifts.find((g) => g.creatorId === key);
    if (byCreator) return byCreator;
  }
  return db.gifts.find((g) => g.id === "gift_world_demo") || null;
}

export function getPublicSecretHint(key: string = "default"): { hint: string } {
  const gift = resolveGift(key);
  return {
    hint: gift?.secretHint || "",
  };
}

export function verifySecretPassword(
  attempt: string,
  clientKey: string = "default_client",
  ownerKey: string = "default"
): {
  success: boolean;
  content?: {
    title: string;
    letter: string;
    photos: string[];
  };
  error?: string;
  remainingAttempts?: number;
  lockedUntilSeconds?: number;
} {
  const now = Date.now();
  let record = rateLimitMap.get(clientKey) || { attempts: 0, lockedUntil: 0 };

  // If previous lockout expired, reset attempts
  if (record.lockedUntil > 0 && record.lockedUntil <= now) {
    record = { attempts: 0, lockedUntil: 0 };
    rateLimitMap.set(clientKey, record);
  }

  // Check if locked out
  if (record.lockedUntil > now) {
    const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return {
      success: false,
      error: `Too many incorrect guesses. Please pause and wait ${remainingSeconds}s.`,
      lockedUntilSeconds: remainingSeconds,
    };
  }

  const gift = resolveGift(ownerKey);

  // If no password is set on the gift, the secret chamber must stay locked
  if (!gift || !gift.secretPassword || !gift.secretPassword.trim()) {
    return {
      success: false,
      error: "The secret chamber is locked. No secret passcode has been configured by the creator.",
    };
  }

  const normalizedAttempt = attempt.trim();
  const check = verifyPasscode(normalizedAttempt, gift.secretPassword);

  if (check.valid) {
    // Reset rate limiting on success
    rateLimitMap.delete(clientKey);

    // Rehash if legacy plaintext was verified
    if (check.needsRehash) {
      gift.secretPassword = hashPasscode(normalizedAttempt);
      const db = loadDatabase();
      saveDatabase(db);
    }

    return {
      success: true,
      content: {
        title: "You found your way in, my love. ♡",
        letter:
          gift.secretContent ||
          "You found it. 🥺\n\nThis secret space is just for us. No one else in the world knows this exists.\n\nI love you. Endlessly. Completely. Always.",
        photos: [
          "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&auto=format&fit=crop&q=80",
        ],
      },
    };
  }

  // Handle failure
  const newAttempts = record.attempts + 1;
  if (newAttempts >= MAX_ATTEMPTS) {
    const lockedUntil = now + LOCKOUT_MS;
    rateLimitMap.set(clientKey, { attempts: newAttempts, lockedUntil });
    return {
      success: false,
      error: "Too many attempts. Locked for 30 seconds to protect our secret space.",
      lockedUntilSeconds: 30,
    };
  }

  rateLimitMap.set(clientKey, { attempts: newAttempts, lockedUntil: 0 });
  return {
    success: false,
    error: "That doesn't seem quite right. Try our special phrase again ♡",
    remainingAttempts: MAX_ATTEMPTS - newAttempts,
  };
}

export function updateSecretConfig(
  newConfig: Partial<SecretWorldConfig>,
  ownerKey: string = "default"
): { success: boolean; config: SecretWorldConfig } {
  const db = loadDatabase();
  const gift = resolveGift(ownerKey);

  if (gift) {
    if (newConfig.password !== undefined && newConfig.password !== "") {
      gift.secretPassword = newConfig.password.startsWith("scrypt$")
        ? newConfig.password
        : hashPasscode(newConfig.password);
    }
    if (newConfig.hint !== undefined) {
      gift.secretHint = newConfig.hint;
    }
    if (newConfig.letter !== undefined) {
      gift.secretContent = newConfig.letter;
    }
    saveDatabase(db);
  }

  const sanitized: SecretWorldConfig = {
    password: gift?.secretPassword ? "••••••••" : "",
    hint: gift?.secretHint || "",
    title: "You found your way in, my love. ♡",
    letter: gift?.secretContent || "",
    photos: [
      "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&auto=format&fit=crop&q=80",
    ],
  };

  return { success: true, config: sanitized };
}

export function getFullSecretConfigForCreator(ownerKey: string = "default"): SecretWorldConfig {
  const gift = resolveGift(ownerKey);
  return {
    password: gift?.secretPassword ? "••••••••" : "",
    hint: gift?.secretHint || "",
    title: "You found your way in, my love. ♡",
    letter: gift?.secretContent || "",
    photos: [
      "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&auto=format&fit=crop&q=80",
    ],
  };
}
