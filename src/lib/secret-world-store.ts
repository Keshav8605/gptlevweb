// Server-side store for Secret World verification, hints, and content.
// Private content is verified on the server and never exposed in client bundles.

export interface SecretWorldConfig {
  password: string;
  hint: string;
  title: string;
  letter: string;
  photos: string[];
}

// In-memory server state with defaults
let secretConfig: SecretWorldConfig = {
  password: "iloveyou",
  hint: "Three words, no spaces, all lowercase — the simplest truth I know 💕",
  title: "Welcome to Our Private Haven",
  letter:
    "You found it. 🥺\n\nThis secret space is just for us. No one else in the world knows this exists.\n\nI wanted you to have a place where you know, without any doubt, how much you mean to me. Not in big gestures or fancy words — but in the quiet, honest truth:\n\nYou are my favorite person. My best friend. My safe place. My greatest adventure.\n\nI don't need the world to know. I just need YOU to know.\n\nI love you. Endlessly. Completely. Always.",
  photos: [
    "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&auto=format&fit=crop&q=80",
  ],
};

// Rate limiting state: IP/Client -> { attempts: number, lockedUntil: number }
interface RateLimitRecord {
  attempts: number;
  lockedUntil: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 30 * 1000; // 30 second cooldown

export function getPublicSecretHint(): { hint: string } {
  return {
    hint: secretConfig.hint,
  };
}

export function verifySecretPassword(
  attempt: string,
  clientKey: string = "default_client"
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

  // Normalize comparison
  const normalizedAttempt = attempt.trim().toLowerCase();
  const normalizedTarget = secretConfig.password.trim().toLowerCase();

  if (normalizedAttempt === normalizedTarget) {
    // Reset rate limiting on success
    rateLimitMap.delete(clientKey);
    return {
      success: true,
      content: {
        title: secretConfig.title,
        letter: secretConfig.letter,
        photos: secretConfig.photos,
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
    error: "That's not the secret phrase. Check the hint and try again ♡",
    remainingAttempts: MAX_ATTEMPTS - newAttempts,
  };
}

export function updateSecretConfig(
  newConfig: Partial<SecretWorldConfig>
): { success: boolean; config: SecretWorldConfig } {
  secretConfig = {
    ...secretConfig,
    ...newConfig,
  };
  return { success: true, config: secretConfig };
}

export function getFullSecretConfigForCreator(): SecretWorldConfig {
  return secretConfig;
}
