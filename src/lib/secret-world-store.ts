// Server-side store for Secret World verification, hints, and content.
// Private content is verified on the server and never exposed in client bundles.
// Isolated per creator to prevent cross-customer leakage.

export interface SecretWorldConfig {
  password: string;
  hint: string;
  title: string;
  letter: string;
  photos: string[];
}

const defaultSecretConfig: SecretWorldConfig = {
  password: "iloveyou",
  hint: "Three words, no spaces, all lowercase — the simplest truth I know 💕",
  title: "You found your way in, my love. ♡",
  letter:
    "You found it. 🥺\n\nThis secret space is just for us. No one else in the world knows this exists.\n\nI wanted you to have a place where you know, without any doubt, how much you mean to me. Not in big gestures or fancy words — but in the quiet, honest truth:\n\nYou are my favorite person. My best friend. My safe place. My greatest adventure.\n\nI don't need the world to know. I just need YOU to know.\n\nI love you. Endlessly. Completely. Always.",
  photos: [
    "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&auto=format&fit=crop&q=80",
  ],
};

// Tenant-isolated store mapping creatorId/giftId -> SecretWorldConfig
const secretConfigMap = new Map<string, SecretWorldConfig>();
secretConfigMap.set("default", defaultSecretConfig);
secretConfigMap.set("gift_world_demo", defaultSecretConfig);

// Rate limiting state: IP/Client -> { attempts: number, lockedUntil: number }
interface RateLimitRecord {
  attempts: number;
  lockedUntil: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 30 * 1000; // 30 second cooldown

export function getPublicSecretHint(key: string = "default"): { hint: string } {
  const config = secretConfigMap.get(key) || defaultSecretConfig;
  return {
    hint: config.hint,
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

  const targetConfig = secretConfigMap.get(ownerKey) || defaultSecretConfig;

  // Normalize comparison
  const normalizedAttempt = attempt.trim().toLowerCase();
  const normalizedTarget = targetConfig.password.trim().toLowerCase();

  if (normalizedAttempt === normalizedTarget) {
    // Reset rate limiting on success
    rateLimitMap.delete(clientKey);
    return {
      success: true,
      content: {
        title: targetConfig.title,
        letter: targetConfig.letter,
        photos: targetConfig.photos,
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
  const current = secretConfigMap.get(ownerKey) || { ...defaultSecretConfig };
  const updated = {
    ...current,
    ...newConfig,
  };
  secretConfigMap.set(ownerKey, updated);
  return { success: true, config: updated };
}

export function getFullSecretConfigForCreator(ownerKey: string = "default"): SecretWorldConfig {
  return secretConfigMap.get(ownerKey) || { ...defaultSecretConfig };
}
