import crypto from "crypto";
import type { RelationshipDatabase } from "./server-db";

/**
 * Hashes a plaintext passcode using Node.js crypto.scryptSync with a 16-byte random salt.
 * Returns formatted string: "scrypt$<saltHex>$<hashHex>"
 */
export function hashPasscode(plain: string): string {
  if (!plain || typeof plain !== "string") return "";
  const trimmed = plain.trim();
  if (!trimmed) return "";
  const salt = crypto.randomBytes(16);
  const derivedKey = crypto.scryptSync(trimmed, salt, 64);
  return `scrypt$${salt.toString("hex")}$${derivedKey.toString("hex")}`;
}

/**
 * Verifies a plaintext passcode against a stored value.
 * Supports legacy plaintext passcodes with migration indicator (needsRehash: true).
 * Uses constant-time comparison (crypto.timingSafeEqual).
 */
export function verifyPasscode(
  plain: string,
  stored?: string | null
): { valid: boolean; needsRehash?: boolean } {
  if (!plain || !stored || typeof plain !== "string" || typeof stored !== "string") {
    return { valid: false };
  }

  const trimmedPlain = plain.trim();
  const trimmedStored = stored.trim();
  if (!trimmedPlain || !trimmedStored) {
    return { valid: false };
  }

  // 1. Scrypt format verification
  if (trimmedStored.startsWith("scrypt$")) {
    if (trimmedPlain.startsWith("scrypt$")) {
      const plainBuf = Buffer.from(trimmedPlain, "utf8");
      const storedBuf = Buffer.from(trimmedStored, "utf8");
      if (plainBuf.length === storedBuf.length && crypto.timingSafeEqual(plainBuf, storedBuf)) {
        return { valid: true, needsRehash: false };
      }
    }

    const parts = trimmedStored.split("$");
    if (parts.length !== 3) {
      return { valid: false };
    }

    const saltHex = parts[1];
    const hashHex = parts[2];
    try {
      const salt = Buffer.from(saltHex, "hex");
      const expectedHash = Buffer.from(hashHex, "hex");
      if (salt.length !== 16 || expectedHash.length !== 64) {
        return { valid: false };
      }

      const actualHash = crypto.scryptSync(trimmedPlain, salt, 64);
      const valid = crypto.timingSafeEqual(actualHash, expectedHash);
      return { valid, needsRehash: false };
    } catch {
      return { valid: false };
    }
  }

  // 2. Legacy plaintext comparison (constant-time buffer compare)
  const plainBuf = Buffer.from(trimmedPlain, "utf8");
  const storedBuf = Buffer.from(trimmedStored, "utf8");

  const isMatch =
    plainBuf.length === storedBuf.length && crypto.timingSafeEqual(plainBuf, storedBuf);

  return { valid: isMatch, needsRehash: isMatch };
}

/**
 * Hashes an invitation token using SHA-256.
 * Format: "sha256$<hashHex>"
 */
export function hashInviteToken(plain: string): string {
  if (!plain || typeof plain !== "string") return "";
  const trimmed = plain.trim();
  if (!trimmed) return "";
  const hash = crypto.createHash("sha256").update(trimmed).digest("hex");
  return `sha256$${hash}`;
}

/**
 * Verifies an incoming invitation token against a stored hash.
 * Supports legacy plaintext tokens with migration indicator (needsRehash: true).
 */
export function verifyInviteToken(
  plain: string,
  stored?: string | null
): { valid: boolean; needsRehash?: boolean } {
  if (!plain || !stored || typeof plain !== "string" || typeof stored !== "string") {
    return { valid: false };
  }

  const trimmedPlain = plain.trim();
  const trimmedStored = stored.trim();
  if (!trimmedPlain || !trimmedStored) {
    return { valid: false };
  }

  // 1. SHA-256 hash format
  if (trimmedStored.startsWith("sha256$")) {
    if (trimmedPlain.startsWith("sha256$")) {
      const plainBuf = Buffer.from(trimmedPlain, "utf8");
      const storedBuf = Buffer.from(trimmedStored, "utf8");
      if (plainBuf.length === storedBuf.length && crypto.timingSafeEqual(plainBuf, storedBuf)) {
        return { valid: true, needsRehash: false };
      }
    }

    const expectedHex = trimmedStored.slice(7);
    try {
      const expectedBuf = Buffer.from(expectedHex, "hex");
      const actualBuf = crypto.createHash("sha256").update(trimmedPlain).digest();
      if (expectedBuf.length !== actualBuf.length) {
        return { valid: false };
      }
      const valid = crypto.timingSafeEqual(actualBuf, expectedBuf);
      return { valid, needsRehash: false };
    } catch {
      return { valid: false };
    }
  }

  // 2. Legacy plaintext token comparison
  const plainBuf = Buffer.from(trimmedPlain, "utf8");
  const storedBuf = Buffer.from(trimmedStored, "utf8");

  const isMatch =
    plainBuf.length === storedBuf.length && crypto.timingSafeEqual(plainBuf, storedBuf);

  return { valid: isMatch, needsRehash: isMatch };
}

/**
 * Migrates all plaintext passcodes and invite tokens in the database to cryptographic hashes.
 * Returns the count of migrated secrets.
 */
export function migrateDatabaseSecrets(db: RelationshipDatabase): number {
  let migratedCount = 0;

  // 1. Config singleton
  if (db.config) {
    if (db.config.creatorPasscode && !db.config.creatorPasscode.startsWith("scrypt$")) {
      db.config.creatorPasscode = hashPasscode(db.config.creatorPasscode);
      migratedCount++;
    }
    if (
      db.config.recipientInviteToken &&
      !db.config.recipientInviteToken.startsWith("sha256$")
    ) {
      db.config.recipientInviteToken = hashInviteToken(db.config.recipientInviteToken);
      migratedCount++;
    }
  }

  // 2. Gifts array
  if (Array.isArray(db.gifts)) {
    for (const gift of db.gifts) {
      if (gift.secretPassword && !gift.secretPassword.startsWith("scrypt$")) {
        gift.secretPassword = hashPasscode(gift.secretPassword);
        migratedCount++;
      }

      if (gift.privacy) {
        if (gift.privacy.passcode && !gift.privacy.passcode.startsWith("scrypt$")) {
          gift.privacy.passcode = hashPasscode(gift.privacy.passcode);
          migratedCount++;
        }
        if (
          gift.privacy.recipientInviteToken &&
          !gift.privacy.recipientInviteToken.startsWith("sha256$")
        ) {
          gift.privacy.recipientInviteToken = hashInviteToken(
            gift.privacy.recipientInviteToken
          );
          migratedCount++;
        }
      }
    }
  }

  return migratedCount;
}
