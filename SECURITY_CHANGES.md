# GPTLevWeb — Security Hardening Documentation

## 1. Executive Summary & Security Posture Transformation

GPTLevWeb is a romantic gifting platform designed for couples to share deeply intimate memories, love letters, audio recordings, journals, and date plans. Prior to this hardening pass, the application suffered from critical architectural vulnerabilities:
- **Mass Data Exposure:** Unauthenticated visitors could query `GET /api/gifts` and receive a listing of all couple gifts stored on the server.
- **Unrestricted Collaborative Endpoints:** Endpoints such as `/api/notebook`, `/api/voice`, `/api/interactions/*`, and `/api/dates/*` did not require authentication or gift authorization, allowing anyone on the internet to read and write private notes, comments, and date proposals.
- **Client-Side Role Spoofing (`{ authorized: true }`):** Client components determined identity and permissions from `localStorage` (`couple_user_role`), and modals contained quick-switch buttons enabling arbitrary role spoofing between creator and recipient.
- **Plaintext Secret Storage:** Passcodes, recipient invite tokens, and secret chamber passwords were stored in plaintext in `.data/relationship-database.json` and transmitted over the wire.
- **Ephemeral In-Memory Secret State:** The secret world chamber was tracked in volatile module memory with a default fallback password (`"iloveyou"`), exposing gifts with unset passwords.

### Post-Hardening Guarantees
- **Tenant & Gift Isolation:** Every collaborative endpoint strictly requires authentication and is bound to a validated `giftId`. Unauthenticated or cross-gift requests are rejected with HTTP 401 or 403.
- **Zero Mass Exposure:** `GET /api/gifts` only reveals a sanitized public demo gift (`gift_world_demo`) to anonymous visitors. Authenticated creators only receive their own gifts.
- **Cryptographic Hashing:** Passcodes are hashed with `scrypt$<saltHex>$<hashHex>` and invite tokens are hashed with `sha256$<hashHex>`. Secrets are stripped over the wire, and the database automatically migrates legacy plaintext secrets on load.
- **Cryptographic Token-Based Recipient Sessions:** Recipients unlock gifts via passcode or invite token and receive an HMAC-SHA256 unlock token bound to the gift. Tokens are stored strictly in `sessionStorage` (cleared on tab close) and verified server-side on all collaborative API requests.
- **Elimination of Role Spoofing:** `localStorage` role overrides and quick-switch UI controls have been completely removed. Roles and display names are derived strictly from the server-validated session.
- **Persistent Secret Chambers:** Secret chamber state is persisted directly within the database gift record, with rate-limiting (5-attempt lockout) and removal of any default password fallback.

---

## 2. Database Backup & Restoration

Before performing any code modifications, a full snapshot of the production JSON database was created.

### Backup File Path
```
.data/relationship-database.backup-1794033297278.json
```
- **Size:** 27,692,324 bytes
- **Checksum / Timestamp:** Created at epoch `1794033297278`

### Restoration Procedure
To restore the database to its pre-hardening state at any time, execute the following PowerShell command from the repository root:
```powershell
Copy-Item -Path ".data/relationship-database.backup-1794033297278.json" -Destination ".data/relationship-database.json" -Force
```

---

## 3. Detailed Inventory of Changes

### New Core Security Modules

#### 1. `src/lib/secrets.ts`
- **Purpose:** Cryptographic hashing and verification for passcodes and tokens, plus automatic database migration.
- **Key Functions:**
  - `hashPasscode(passcode: string)`: Generates a 16-byte cryptographically secure salt and derives an `scrypt` key (32 bytes). Formats as `scrypt$<saltHex>$<hashHex>`.
  - `verifyPasscode(passcode: string, storedHash?: string)`: Timing-safe comparison using `crypto.timingSafeEqual`. Supports both plaintext inputs (which get hashed) and pre-hashed tokens for backward compatibility.
  - `hashInviteToken(token: string)`: Hashes invitation tokens using SHA-256 (`sha256$<hashHex>`).
  - `verifyInviteToken(token: string, storedHash?: string)`: Timing-safe verification of invitation tokens.
  - `migrateDatabaseSecrets(db)`: Scans all gifts and upgrades plaintext passcodes, invite tokens, and secret passwords to cryptographic hashes on database load.

#### 2. `src/lib/access-guard.ts`
- **Purpose:** Centralized, unified access verification for gift-scoped resources.
- **Key Functions:**
  - `requireGiftAccess(request: Request, giftIdParam?: string | null)`:
    - Extracts credentials from `x-gift-unlock-token`, `x-unlock-token`, `x-participant-token`, `Authorization: Bearer`, or URL query parameters.
    - Validates Creator Supabase JWTs: verifies signature, expiration, issuer, and matches `userId === gift.creatorId`.
    - Validates Recipient Unlock Tokens: verifies HMAC signature against `GIFT_UNLOCK_SECRET` and asserts `tokenGiftId === targetGift.id`.
    - Resolves authentic role (`creator` | `recipient`) and bound display name (`gift.creatorNickname` | `gift.recipientNickname`).
    - Returns `{ authorized: true, gift, role, name, isCreator, isRecipient }` or `{ authorized: false, status: 401 | 403, error }`.

#### 3. `src/lib/client-auth.ts`
- **Purpose:** Client-side scoped credential storage and request header injection.
- **Key Functions:**
  - `storeUnlockToken(slugOrId, token, giftId)`: Stores unlock token in `sessionStorage` under `gift_unlock_<identifier>` (cleared when browser session ends).
  - `getStoredUnlockToken(slugOrId)`: Retrieves active token for a specific gift.
  - `clearStoredUnlockToken(slugOrId)`: Removes session token.
  - `getUnlockHeaders(slugOrId)`: Generates HTTP request headers `{ "x-gift-unlock-token": token }` for API calls.

---

### Hardened Database & Store Modules

#### 4. `src/lib/server-db.ts`
- Added call to `migrateDatabaseSecrets` within `loadDatabase()` to ensure all plaintext secrets are hashed immediately when loaded into memory.
- Updated `verifyAccess` to support `verifyPasscode` and `verifyInviteToken`.
- Hardened `getGifts(userId)`: unauthenticated requests only receive public demo gift summaries; authenticated creators only receive their own gifts.
- Updated `deleteComment`, `deleteVoiceMessage`, and `deleteDateMemory` to enforce author verification (creators can delete any item in their gift; recipients can only delete items they created).
- Gift updates (`updateGift`) strictly preserve immutable system fields (`id`, `creatorId`, `createdAt`, `recipientInviteToken`).

#### 5. `src/lib/secret-world-store.ts`
- Removed ephemeral in-memory chamber dictionary (`secretWorldStore`).
- Persisted secret chamber state directly on the database `GiftRecord` (`secretWorldConfig`).
- Eliminated default `"iloveyou"` fallback password.
- Integrated `verifyPasscode` with `scrypt` hashing and 5-attempt rate-limiting lockout with cooldown.

---

### Hardened API Endpoints

| Route | Methods | Authentication Requirement | Key Security Controls |
|---|---|---|---|
| `GET /api/gifts` | GET | Optional / JWT | Anonymous callers receive only `gift_world_demo` summary. Creators receive only their own gifts. Recipient tokens cannot list creator gifts. |
| `POST /api/gifts` | POST | Supabase JWT | Creator authentication required. Assigns `creatorId`, generates hashed invite tokens and passcodes. |
| `GET /api/gifts/by-slug/[slug]` | GET | Passcode / Invite / JWT | Scrypt passcode and SHA-256 invite token validation. Strips all plaintext secrets and hashes from response. Issues HMAC unlock token. |
| `GET /api/gifts/[id]` | GET | Passcode / Invite / JWT | Scrypt passcode validation. Owner view shows `hasPasscode: true` instead of exposing raw hash. Non-owners receive stripped view. |
| `PUT /api/gifts/[id]` | PUT | Supabase JWT | Enforces gift ownership (`userId === gift.creatorId`). Whitelists updatable fields, immutability of `creatorId` and `id`. |
| `DELETE /api/gifts/[id]` | DELETE | Supabase JWT | Enforces gift ownership. Protected demo gifts cannot be deleted. |
| `GET/POST /api/session` | GET | Unlock Token / JWT | Validates session token or JWT and returns authentic `{ authenticated, role, name, giftId }`. |
| `GET/POST/PUT/DELETE /api/notebook` | ALL | `requireGiftAccess` | Requires `giftId`. Server derives `authorRole` and `authorName`. Blocks cross-gift data access. |
| `GET/POST/DELETE /api/voice` | ALL | `requireGiftAccess` | Scopes voice notes to authorized gift participants. Author verified on delete. |
| `GET/POST/DELETE /api/interactions/comments` | ALL | `requireGiftAccess` | Enforces gift membership. Server binds comment author. Author verified on delete. |
| `GET/POST /api/interactions/reactions` | ALL | `requireGiftAccess` | Enforces gift membership. Prevents spoofed participant reactions. |
| `GET/POST/DELETE /api/dates/memories` | ALL | `requireGiftAccess` | Requires `giftId`. Eliminates role spoofing. |
| `GET/POST /api/dates/proposals` | ALL | `requireGiftAccess` | Scopes proposals to authenticated gift participants. |
| `GET /api/dates/proposals/[id]` | GET | `requireGiftAccess` | Verifies proposal belongs to requested gift and participant has access. |
| `PATCH .../[id]/checklist` | PATCH | `requireGiftAccess` | Validates proposal ownership and gift context. |
| `POST .../[id]/transition` | POST | `requireGiftAccess` | Enforces valid status transitions for authorized couple members. |
| `GET/POST /api/dates/preferences` | ALL | `requireGiftAccess` | Scopes date night preferences to authorized gift participants. |
| `GET/POST/PUT/DELETE /api/dates/ideas` | ALL | `requireGiftAccess` | Scopes collaborative date ideas to authorized gift participants. |
| `GET/PATCH /api/dates/notifications` | ALL | `requireGiftAccess` | Scopes notifications to verified gift context. |
| `GET/POST .../notifications/settings` | ALL | Supabase JWT | Strictly requires creator JWT. POST validates strict whitelist of boolean settings keys. |
| `POST /api/secret/verify` | POST | Rate-Limited Passcode | Scoped to `giftId`. Verifies secret password using `scrypt`. Enforces 5-attempt lockout. |
| `POST /api/auth/access` | POST | Passcode / Invite / JWT | Verifies credentials and issues HMAC-SHA256 unlock token. |

---

### Hardened Client Components

#### 1. `src/app/gift/[slug]/page.tsx`
- Stores unlock token into `sessionStorage` via `storeUnlockToken(slug, token, gift.id)` upon successful unlock.
- Automatically passes `giftId={gift.id}` down to `SharedInteractions`, `NotebookSection`, `VoiceMessageSection`, and `DatePlannerSection`.
- Displays inline passcode challenge without exposing protected content when `isLocked: true`.

#### 2. `src/components/auth/ParticipantAccessModal.tsx`
- **Removed `handleQuickSwitch`:** Eliminated UI buttons and logic that allowed switching between "I am Creator" and "I am Recipient" at will.
- **Removed `localStorage` Role Tampering:** Eliminated setting `localStorage.setItem("couple_user_role", ...)` or `couple_user_name`.

#### 3. `src/components/interactions/SharedInteractions.tsx`
- Accepts `giftId` prop.
- Attaches `getUnlockHeaders(giftId)` to all comment and reaction requests.
- Derives author identity from validated session rather than `localStorage`.

#### 4. `src/components/planner/DatePlannerSection.tsx`
- Accepts `giftId` prop and appends `giftId` to all query parameters and request bodies.
- Attaches `getUnlockHeaders(giftId)` to all proposal, preference, memory, and notification requests.
- Removes client-side role overrides.

#### 5. `src/components/sections/NotebookSection.tsx`
- Accepts `giftId` prop and passes `giftId` with `getUnlockHeaders(giftId)`.
- Eliminates client-side author forgery.

#### 6. `src/components/sections/VoiceMessageSection.tsx`
- Accepts `giftId` prop and passes `giftId` with `getUnlockHeaders(giftId)` for audio uploads and deletion.

#### 7. `src/app/story/layout.tsx`
- Retrieves and stores unlock token using `src/lib/client-auth.ts`.
- Binds participant session to the active story gift.

---

## 4. Verification & Audit Results

### 1. TypeScript Static Analysis
- **Command:** `npx tsc --noEmit`
- **Status:** **PASSED (0 errors)**

### 2. ESLint Static Analysis
- **Command:** `npm run lint`
- **Status:** **PASSED (0 errors, 48 pre-existing React Hook warnings in UI components)**

### 3. Application Regression Test Suite (`scripts/regression-suite.ts`)
- **Status:** **33 / 33 tests passed (0 failed)**
- **Coverage:**
  - Journey A: Gift Lifecycle (Create, Save, Duplicate, Preview, Publish, Revoke)
  - Journey B: Secret World Verification & Rate Limiting
  - Journey C: Two-Way Interactions (Reactions, Comments, Notebook)
  - Journey D: Collaborative Date Planner Workflow (Proposals, Transitions, Memories)
  - Journey E: Media Vault Upload & MIME Validation
  - Journey F: Unpublishing & Public Access Revocation

### 4. Security Regression Test Suite (`scripts/security-regression-suite.ts`)
- **Status:** **246 / 246 tests passed (0 failed)**
- **Coverage:**
  - Cryptographic JWT Verification & Alg:none / signature forgery rejection
  - Secure Media Endpoints & Gift Isolation
  - Media Upload Protections & Strict Payload Constraints
  - Media Deletion Ownership Controls
  - Response Center Tenant Isolation
  - Draft Access Controls & Recipient Token Revocation
  - Gift Duplication & Legacy Demo Protection
  - Strict Gift Update Field Immutability
  - Header & POST-based Passcode Unlocking
  - Zero Plaintext Passwords / Tokens in Console Logs

### 5. Phase 1–4 Hardening Test Suite (`scripts/security-phase2.ts`)
- **Status:** **51 / 51 tests passed (0 failed)**
- **Coverage:**
  - Scenario 1: `GET /api/gifts` Access Controls & Demo Isolation
  - Scenario 2: `GET /api/gifts/by-slug/[slug]` Passcode & Token Unlock
  - Scenario 3: Collaborative Endpoints Reject Unauthenticated Requests
  - Scenario 4: Recipient Unlock Token Binding & Integrity
  - Scenario 5: Creator Collaborative Privileges & Tenant Isolation
  - Scenario 6: Secret Chamber Verification & Rate Limiting
  - Scenario 7: Database Secret Hashing & Zero Plaintext Secrets
  - Scenario 8: Notification Settings Creator Authorization
  - Scenario 9: `GET /api/session` Verification

**Total Verified Assertions:** **330 / 330 Passed (100% Success Rate)**

---

## 5. Architectural Boundaries & Next Steps (Supabase PostgreSQL Migration)

While this pragmatic hardening pass has completely closed the application-layer security vulnerabilities, certain limitations remain inherent to a file-based JSON architecture:
1. **Concurrency & File Locking:** The JSON database uses synchronous file writes with atomic rename (`renameSync`). Under high concurrent load from many simultaneous users, writes may contend or experience race conditions that require database row-level locking.
2. **Distributed Process Isolation:** Because state is stored on the local filesystem, multi-instance horizontal scaling (e.g., serverless lambda containers or multiple server nodes) requires a centralized database.
3. **Database-Level Row Security (RLS):** Security is currently enforced at the Next.js API layer. In a full Supabase PostgreSQL migration, Row-Level Security policies inside the database engine provide defense-in-depth even if an application route has a bug.
4. **Binary Media Storage:** Media assets are stored as base64 data URLs in JSON records. Moving to Supabase Storage buckets with signed URLs will drastically reduce memory overhead and improve media streaming performance.

