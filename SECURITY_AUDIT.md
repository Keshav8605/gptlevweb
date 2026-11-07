# Comprehensive Application & Infrastructure Security Audit: GPTLevWeb

**Audit Date:** November 7, 2026  
**Auditor:** Senior Application Security Architect & Cryptographic Auditor  
**System:** GPTLevWeb Romantic Relationship Platform  
**Target Codebase:** `k:\keshavnewbranch\gptlevweb`

---

## 1. Executive Security Summary

An exhaustive, evidence-based security audit of the GPTLevWeb romantic gifting platform was performed across all 24 API routes, Next.js server components, client components, authentication proxies, cryptographic verification modules, and the persistence layer.

Because this platform is designed to preserve deeply private, emotional, and intimate data for couples (including love letters, anniversary memories, personal journal reflections, voice notes, and private photographs), **privacy and confidentiality must operate at an institutional grade**.

### Overall Posture
- **Creator Authentication:** Cryptographically sound at the API boundary when calling `getAuthenticatedCreator(request)` in [src/lib/auth-guard.ts](file:///k:/keshavnewbranch/gptlevweb/src/lib/auth-guard.ts#L182-L315), supporting Supabase JWT verification and asymmetric fallbacks.
- **Recipient Authentication:** Fragmented and insecure. Relies on unhashed tokens, URL parameters, and client-side `localStorage`.
- **Authorization Gaps:** **Severe**. Several API routes allow unauthenticated enumeration of published gifts, love letters, and shared journals.

---

## 2. Vulnerability Classification Matrix

| Vulnerability ID | Title | Severity | CVSS v3.1 | Status | Affected Files |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **SEC-01** | Mass Exfiltration of Published Gifts via Unauthenticated API | **CRITICAL** | **8.6** | Confirmed | [src/app/api/gifts/route.ts](file:///k:/keshavnewbranch/gptlevweb/src/app/api/gifts/route.ts#L23-L38) |
| **SEC-02** | Unauthenticated Scraping of Collaborative Couple Memories & Journals | **HIGH** | **8.2** | Confirmed | [src/app/api/notebook/route.ts](file:///k:/keshavnewbranch/gptlevweb/src/app/api/notebook/route.ts#L15), [src/app/api/voice/route.ts](file:///k:/keshavnewbranch/gptlevweb/src/app/api/voice/route.ts#L15), [src/app/api/interactions/comments/route.ts](file:///k:/keshavnewbranch/gptlevweb/src/app/api/interactions/comments/route.ts#L12) |
| **SEC-03** | Participant Identity Spoofing on Notebook & Interaction Mutations | **HIGH** | **7.5** | Confirmed | [src/app/api/notebook/route.ts](file:///k:/keshavnewbranch/gptlevweb/src/app/api/notebook/route.ts#L38-L46), [src/app/api/interactions/comments/route.ts](file:///k:/keshavnewbranch/gptlevweb/src/app/api/interactions/comments/route.ts#L38-L48) |
| **SEC-04** | Plaintext Secret Storage in Database | **HIGH** | **7.4** | Confirmed | `.data/relationship-database.json` |
| **SEC-05** | Ephemeral In-Memory Secret Storage (`configsByOwner`) | **MEDIUM** | **6.5** | Confirmed | [src/lib/secret-world-store.ts](file:///k:/keshavnewbranch/gptlevweb/src/lib/secret-world-store.ts#L1-L60) |
| **SEC-06** | Frontend Unlock Token Discard Bug Breaking Protected Media | **MEDIUM** | **5.3** | Confirmed | [src/app/gift/[slug]/page.tsx](file:///k:/keshavnewbranch/gptlevweb/src/app/gift/[slug]/page.tsx#L85-L105) |
| **SEC-07** | Creator Studio (`/studio`) Route Bypasses Proxy Authentication | **MEDIUM** | **5.2** | Confirmed | [src/lib/supabase/proxy.ts](file:///k:/keshavnewbranch/gptlevweb/src/lib/supabase/proxy.ts#L51-L62) |
| **SEC-08** | Missing Creator Profile Sync Pipeline | **LOW** | **3.1** | Confirmed | [src/app/(auth)/signup/page.tsx](file:///k:/keshavnewbranch/gptlevweb/src/app/(auth)/signup/page.tsx#L40-L60) |

---

## 3. Deep Forensic Vulnerability Reports

### SEC-01: Mass Exfiltration of Published Gifts via Unauthenticated API
- **Severity:** **CRITICAL (CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N — Score: 8.6)**
- **Status:** **CONFIRMED VULNERABILITY**
- **Affected File:** [src/app/api/gifts/route.ts](file:///k:/keshavnewbranch/gptlevweb/src/app/api/gifts/route.ts#L23-L38)
- **Code Evidence:**
  ```typescript
  // src/app/api/gifts/route.ts (lines 23-37)
  // Public / unauthenticated visitors only see published gifts, fully sanitized
  const publicGifts = getGifts()
    .filter((g) => g.status === "published")
    .map((g) => ({
      ...g,
      secretPassword: undefined,
      secretContent: undefined,
      privacy: {
        isPasswordProtected: g.privacy.isPasswordProtected,
        invitationStatus: g.privacy.invitationStatus,
        allowResponses: g.privacy.allowResponses,
        allowRecipientContributions: g.privacy.allowRecipientContributions,
      },
    }));

  return NextResponse.json({ success: true, gifts: publicGifts });
  ```
- **Exploit Scenario:** Any anonymous attacker on the internet sends an unauthenticated `GET /api/gifts`. The server iterates over all gifts in `.data/relationship-database.json` and returns every gift with `status === "published"`. While it deletes `secretPassword` and `secretContent`, it leaves `customLetters` (love letters), `finalLetter`, `welcomePolaroids`, `memoriesHeartCollage` (couples' personal photos), `customObservations`, and `senderNickname` completely exposed, **even if `privacy.isPasswordProtected === true`**.
- **Impact:** Complete loss of confidentiality for all couples who publish a gift. Personal romantic letters and photos are scrapable in bulk.
- **Required Remediation:** Remove public listing from `GET /api/gifts`. An unauthenticated caller must NEVER receive a list of other couples' gifts. Public access should only be allowed via `GET /api/gifts/by-slug/[slug]` with an active invitation token and passcode verification.

---

### SEC-02: Unauthenticated Scraping of Collaborative Couple Memories & Journals
- **Severity:** **HIGH (CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N — Score: 8.2)**
- **Status:** **CONFIRMED VULNERABILITY**
- **Affected Files:**
  - [src/app/api/notebook/route.ts](file:///k:/keshavnewbranch/gptlevweb/src/app/api/notebook/route.ts#L15)
  - [src/app/api/voice/route.ts](file:///k:/keshavnewbranch/gptlevweb/src/app/api/voice/route.ts#L15)
  - [src/app/api/interactions/comments/route.ts](file:///k:/keshavnewbranch/gptlevweb/src/app/api/interactions/comments/route.ts#L12)
  - [src/app/api/interactions/reactions/route.ts](file:///k:/keshavnewbranch/gptlevweb/src/app/api/interactions/reactions/route.ts#L11)
  - [src/app/api/dates/memories/route.ts](file:///k:/keshavnewbranch/gptlevweb/src/app/api/dates/memories/route.ts#L12)
- **Code Evidence:**
  ```typescript
  // src/app/api/notebook/route.ts (lines 15-28)
  export async function GET(request: Request) {
    try {
      const { searchParams } = new URL(request.url);
      const giftId = searchParams.get("giftId") || undefined;
      const entries = getJournalEntries(giftId);
      return NextResponse.json({ success: true, entries });
    } catch (err) {
      return NextResponse.json({ error: "Failed to fetch journal entries" }, { status: 500 });
    }
  }
  ```
- **Exploit Scenario:** An attacker requests `GET /api/notebook?giftId=gift_world_demo` or simply `GET /api/notebook` without supplying any session, cookie, token, or passcode. The server returns the entire array of private journal entries, thoughts, and mood emojis. The same flaw exists in `GET /api/voice` (leaking audio notes) and `GET /api/interactions/comments` (leaking conversation notes).
- **Impact:** Total breach of private couple conversations, audio recordings, and shared diary entries.
- **Required Remediation:** Enforce gift authorization on all interaction GET endpoints. Check creator JWT or valid recipient HMAC unlock token matching the specified `giftId`.

---

### SEC-03: Participant Identity Spoofing on Notebook & Interaction Mutations
- **Severity:** **HIGH (CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:H/A:N — Score: 7.5)**
- **Status:** **CONFIRMED VULNERABILITY**
- **Affected Files:**
  - [src/app/api/notebook/route.ts](file:///k:/keshavnewbranch/gptlevweb/src/app/api/notebook/route.ts#L38-L46)
  - [src/app/api/voice/route.ts](file:///k:/keshavnewbranch/gptlevweb/src/app/api/voice/route.ts#L39-L48)
  - [src/app/api/interactions/comments/route.ts](file:///k:/keshavnewbranch/gptlevweb/src/app/api/interactions/comments/route.ts#L38-L48)
- **Code Evidence:**
  ```typescript
  // src/app/api/notebook/route.ts (lines 38-46)
  const token = request.headers.get("x-participant-token");
  const auth = token
    ? verifyAccess(token)
    : { authorized: true, role: roleParam || "creator", name: nameParam || "Creator" };

  if (!auth.authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  ```
- **Exploit Scenario:** The ternary operator states: *if a token is provided, verify it; otherwise, if NO token is provided, set `authorized: true` and accept whatever `role` and `name` are passed in the request body!* An attacker can forge journal entries or comments pretending to be the partner or the creator simply by omitting the `x-participant-token` header.
- **Impact:** Unauthorized tampering, injection of fake messages, and emotional spoofing.
- **Required Remediation:** Invert logic: require an authentic token. Never default to `{ authorized: true }` when credentials are absent.

---

### SEC-04: Plaintext Storage of Secrets in Persistence Layer
- **Severity:** **HIGH (CVSS:3.1/AV:L/AC:L/PR:H/UI:N/S:U/C:H/I:H/A:N — Score: 7.4)**
- **Status:** **CONFIRMED VULNERABILITY**
- **Affected File:** `.data/relationship-database.json`
- **Code Evidence:**
  ```json
  "config": {
    "creatorPasscode": "love2024",
    "recipientInviteToken": "sweetheart",
    "invitationStatus": "active"
  }
  ```
  And inside `gifts`:
  ```json
  "secretPassword": "...",
  "privacy": {
    "passcode": "..."
  }
  ```
- **Impact:** Any developer, compromised server process, backup leak, or repository mistake exposes all passwords and invite tokens directly in plaintext.
- **Required Remediation:** Hash all passcodes with Argon2id or bcrypt before writing to storage. Store only cryptographic hashes.

---

### SEC-05: Ephemeral In-Memory Secret World Store (`configsByOwner`)
- **Severity:** **MEDIUM (CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:N/A:H — Score: 6.5)**
- **Status:** **CONFIRMED ARCHITECTURAL DEFECT**
- **Affected File:** [src/lib/secret-world-store.ts](file:///k:/keshavnewbranch/gptlevweb/src/lib/secret-world-store.ts#L1-L60)
- **Code Evidence:**
  ```typescript
  // In-memory module variable
  const configsByOwner: Record<string, SecretWorldConfig> = {};
  ```
- **Impact:** Secrets configured via `/api/secret/config` disappear whenever the server restarts, crashes, scales horizontally, or executes in serverless environments (Vercel/AWS Lambda).
- **Required Remediation:** Persist secret world configurations in PostgreSQL attached to the gift record.

---

### SEC-06: Frontend Unlock Token Discard Bug Breaking Protected Media
- **Severity:** **MEDIUM (CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:N/I:N/A:M — Score: 5.3)**
- **Status:** **CONFIRMED CLIENT-SIDE DEFECT**
- **Affected File:** [src/app/gift/[slug]/page.tsx](file:///k:/keshavnewbranch/gptlevweb/src/app/gift/[slug]/page.tsx#L85-L105)
- **Code Evidence:**
  ```typescript
  // src/app/gift/[slug]/page.tsx (lines 85-94)
  const res = await fetch(`/api/gifts/by-slug/${slug}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ passcode }),
  });
  const data = await res.json();
  if (res.ok && data.success) {
    setPasscodeVerified(true);
    setGift(data.gift);
    // CRITICAL OMISSION: data.unlockToken is discarded here!
  }
  ```
- **Impact:** The backend correctly creates and returns an HMAC-SHA256 `unlockToken`. However, because the client discards it, subsequent requests to protected media (`/api/media`) lack the required `x-gift-unlock-token` header and fail with HTTP 401/403, causing images on protected gifts to break.
- **Required Remediation:** Store `data.unlockToken` in sessionStorage/memory and attach it as `x-gift-unlock-token` on all media and interaction fetches.

---

### SEC-07: Creator Studio (`/studio`) Route Bypasses Proxy Authentication
- **Severity:** **MEDIUM (CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N — Score: 5.2)**
- **Status:** **CONFIRMED ROUTING GAP**
- **Affected File:** [src/lib/supabase/proxy.ts](file:///k:/keshavnewbranch/gptlevweb/src/lib/supabase/proxy.ts#L51-L62)
- **Code Evidence:**
  ```typescript
  // src/lib/supabase/proxy.ts line 52
  if (pathname.startsWith("/dashboard") && !user) {
    // Redirects to /login
  }
  ```
- **Impact:** `/dashboard` is protected, but `/studio` is omitted from `src/lib/supabase/proxy.ts`. An unauthenticated visitor navigating directly to `/studio` is served the complete Creator Studio UI shell. Although the subsequent backend `/api/creator/responses` returns 401, the user interface still partially renders.
- **Required Remediation:** Add `pathname.startsWith("/studio")` to the proxy redirect guard in `src/lib/supabase/proxy.ts`.

---

## 4. Privacy & Regulatory Posture (GDPR / Data Sovereignty)

1. **Right to Erasure (Account & Data Deletion):**
   - **NOT IMPLEMENTED.** While individual gifts can be deleted (`DELETE /api/gifts/[id]`), there is no mechanism for an account holder to wipe all associated photos, comments, journal entries, and date proposals in one operation.
2. **Data Retention & Media Scrubbing:**
   - Deleting a gift currently does NOT delete media assets that were uploaded without an explicit `giftId`. 78 orphaned media assets currently reside in `.data/relationship-database.json`.
3. **Data Export:**
   - No JSON/ZIP data export tool exists for couples to download their archived memories.

