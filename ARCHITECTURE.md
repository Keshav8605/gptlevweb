# System Architecture, Data Flow & Deployment Blueprints: GPTLevWeb

**Audit Date:** November 7, 2026  
**Auditor:** Principal Enterprise Systems Architect & Cloud Infrastructure Engineer  
**System:** GPTLevWeb Romantic Relationship Platform  
**Target Codebase:** `k:\keshavnewbranch\gptlevweb`

---

## 1. High-Level System Architecture

The current architecture is a monolithic Next.js 16 App Router application operating with a hybrid auth model and a local JSON persistence layer:

```mermaid
graph TD
    subgraph ClientLayer ["Client Devices (Browser / Mobile)"]
        Creator["Creator (Studio & Dashboard)"]
        Recipient["Recipient (Gift Experience)"]
    end

    subgraph EdgeProxy ["Next.js Edge Proxy (src/proxy.ts)"]
        Matcher["URL Matcher & Session Sync"]
        RouteGuard["/dashboard Auth Guard"]
    end

    subgraph AppRouter ["Next.js 16 App Router Server"]
        AuthRoutes["Supabase Auth API Proxy"]
        GiftsAPI["/api/gifts Routes (CRUD)"]
        InteractionsAPI["/api/interactions & /api/notebook"]
        DatesAPI["/api/dates/* (Planner)"]
        MediaAPI["/api/media & /api/media/upload"]
        SecretAPI["/api/secret/* (Unlock)"]
    end

    subgraph SecurityModule ["Security & Verification Layer"]
        AuthGuard["auth-guard.ts (JWT & HMAC)"]
        MemorySecretStore["secret-world-store.ts (RAM)"]
    end

    subgraph DataLayer ["Persistence Layer"]
        ServerDB["server-db.ts (Read/Write Mutex)"]
        LocalJSON[".data/relationship-database.json (26.4 MB)"]
        SupabaseRemoteAuth["Supabase Remote Auth Service"]
    end

    Creator -->|HTTPS /sb-token| Matcher
    Recipient -->|HTTPS /slug| Matcher
    Matcher --> RouteGuard
    RouteGuard --> AppRouter

    AppRouter --> AuthGuard
    AuthGuard -->|Remote Validate| SupabaseRemoteAuth
    AuthGuard -->|HMAC-SHA256| AppRouter
    AppRouter --> MemorySecretStore

    AppRouter --> ServerDB
    ServerDB -->|Atomic File Lock| LocalJSON
```

---

## 2. Authentication & Authorization Flow (Split-Brain Architecture)

The system enforces two completely distinct authentication pipelines:

```mermaid
sequenceDiagram
    autonumber
    actor Creator as Creator (Browser)
    actor Recipient as Recipient (Browser)
    participant Server as Next.js App Router
    participant Guard as auth-guard.ts
    participant SupaAuth as Supabase Auth Service
    participant JSON as relationship-database.json

    %% Creator Flow
    Note over Creator,SupaAuth: CREATOR AUTHENTICATION LIFECYCLE
    Creator->>Server: POST /login (email, password)
    Server->>SupaAuth: signInWithPassword(email, password)
    SupaAuth-->>Server: Return Session { access_token, refresh_token, user }
    Server-->>Creator: Set HttpOnly Cookie (sb-auth-token)
    Creator->>Server: GET /api/gifts (Cookie attached)
    Server->>Guard: getAuthenticatedCreator(request)
    Guard->>SupaAuth: getUser(token) OR local verify
    Guard-->>Server: { authenticated: true, userId: "uuid" }
    Server->>JSON: getGifts(userId)
    JSON-->>Server: Filtered Creator Gifts
    Server-->>Creator: 200 OK { gifts: [...] }

    %% Recipient Flow
    Note over Recipient,JSON: RECIPIENT AUTHENTICATION LIFECYCLE
    Recipient->>Server: GET /gift/our-anniversary
    Server->>JSON: getGiftBySlug("our-anniversary")
    JSON-->>Server: Gift Record (isPasswordProtected: true)
    Server-->>Recipient: Render Passcode Lock Screen
    Recipient->>Server: POST /api/gifts/by-slug/our-anniversary { passcode: "secret" }
    Server->>Guard: Verify plaintext passcode & generate HMAC token
    Guard-->>Server: unlockToken ("recipient:gift_id:exp:signature")
    Server-->>Recipient: 200 OK { success: true, unlockToken, gift: [...] }
    Note over Recipient: Frontend bug discards unlockToken!
```

---

## 3. Photo & Media Upload Lifecycle

Media assets are currently ingested, processed, and stored as Base64 strings directly inside the JSON database:

```mermaid
flowchart TD
    A["User selects Photo (PNG/JPG/WEBP <= 10MB)"] --> B["FileReader converts File to Data URL"]
    B --> C["POST /api/media/upload (FormData / JSON)"]
    C --> D["auth-guard.ts: Check Creator JWT or Recipient Token"]
    D --> E["server-db.ts: Validate MIME type & file size"]
    E --> F["Generate unique ID (media_timestamp_random)"]
    F --> G["Append MediaAsset to mediaAssets[] in RAM"]
    G --> H["Write to .data/relationship-database.json.tmp"]
    H --> I["Atomic Rename .tmp -> relationship-database.json"]
    I --> J["Return { success: true, asset: { id, dataUrl } }"]
    J --> K["UI renders inline image from base64 string"]
```

---

## 4. Voice Recording & Playback Lifecycle

```mermaid
flowchart TD
    A["Partner taps Record Whispers button"] --> B["navigator.mediaDevices.getUserMedia(audio)"]
    B --> C["MediaRecorder captures audio/webm chunks"]
    C --> D["Stop recording -> Create Blob"]
    D --> E["FileReader reads Blob as Base64 Data URL"]
    E --> F["POST /api/voice { audioData, duration, sender }"]
    F --> G["auth-guard.ts: Verify participant token (or fallback)"]
    G --> H["server-db.ts: Append to voiceMessages[] in JSON"]
    H --> I["Atomic file persist (.data/relationship-database.json)"]
    I --> J["Partner visits Voice Notes chapter"]
    J --> K["GET /api/voice?giftId=xyz"]
    K --> L["HTML5 Audio Element streams base64 dataUrl"]
```

---

## 5. Frontend-to-Backend Request Lifecycle

```mermaid
sequenceDiagram
    participant UI as React 19 Client Component
    participant Proxy as src/proxy.ts
    participant Route as Next.js API Handler (route.ts)
    participant Guard as src/lib/auth-guard.ts
    participant DB as src/lib/server-db.ts
    participant Storage as File / Cloud DB

    UI->>Proxy: Fetch Request (e.g. PUT /api/gifts/123)
    Proxy->>Proxy: Refresh session token cookies if needed
    Proxy->>Route: Forward Request with updated headers
    Route->>Guard: getAuthenticatedCreator(request)
    Guard-->>Route: AuthContext { authenticated, userId, role }
    alt Not Authenticated
        Route-->>UI: 401 Unauthorized / 403 Forbidden
    else Authenticated
        Route->>Route: Validate request body & payload size
        Route->>DB: updateGift(giftId, payload, userId)
        DB->>DB: Check creatorId == userId (Tenant Isolation)
        DB->>Storage: Atomic file flush
        DB-->>Route: Updated Record
        Route-->>UI: 200 OK JSON Response
    end
```

---

## 6. Complete Verified User Journey

```mermaid
flowchart TD
    Start(["New Visitor Opens Site"]) --> Landing["Landing Page (src/app/page.tsx)"]
    
    Landing --> Choice{"User Intent"}
    Choice -->|Explore Gift| SlugView["Personalized Gift URL (/gift/[slug])"]
    Choice -->|Create Gift| AuthCheck{"Logged In?"}
    
    AuthCheck -->|No| Login["Login / Signup Page (/login, /signup)"]
    Login --> Studio["Creator Studio (/studio)"]
    AuthCheck -->|Yes| Studio
    
    Studio --> Wizard["10-Step Gift Creation Wizard"]
    Wizard --> Basics["Step 1: Partner Names & Milestones"]
    Basics --> Welcome["Step 2: Opening Envelope Note"]
    Welcome --> Chapters["Step 3: Toggle & Reorder Chapters"]
    Chapters --> MediaUpload["Step 4: Upload Photos & Media"]
    MediaUpload --> PrivacyConfig["Step 5: Set Passcode & Passwords"]
    PrivacyConfig --> Preview["Live Preview (iPhone Simulator)"]
    Preview --> Publish["Publish Experience (Generate Slug)"]
    
    Publish --> Share["Copy Link & Share with Partner"]
    Share --> RecipientEnter["Partner Opens Link (/gift/[slug])"]
    
    RecipientEnter --> PasscodeCheck{"Passcode Protected?"}
    PasscodeCheck -->|Yes| EnterPasscode["Enter Romantic Passcode"]
    EnterPasscode --> GiftExperience["Romantic Interactive Web Experience"]
    PasscodeCheck -->|No| GiftExperience
    
    GiftExperience --> Ch1["1. Welcome Envelope Opening"]
    Ch1 --> Ch2["2. Things I Noticed About You"]
    Ch2 --> Ch3["3. Secret World (Password Gate)"]
    Ch3 --> Ch4["4. Scrapbook Memories (Polaroid Lightbox)"]
    Ch4 --> Ch5["5. Our Song (Spinning Vinyl & Chimes)"]
    Ch5 --> Ch6["6. Open When Letters"]
    Ch6 --> Ch7["7. Shared Notebook (Partner Journal)"]
    Ch7 --> Ch8["8. Date Planner (Proposals & Itineraries)"]
    Ch8 --> Ch9["9. Voice Whispers (Audio Playback)"]
    Ch9 --> Finale["10. Anniversary Counter & Heart Fireworks"]
```

---

## 7. Target Production Deployment Architecture (Supabase Migration Target)

```mermaid
graph TD
    subgraph CDN ["Edge Network (Vercel / Cloudflare)"]
        Edge["Global Edge CDN & SSL Termination"]
        NextSSR["Next.js Serverless SSR / API Handlers"]
    end

    subgraph SupabaseCloud ["Supabase Managed Cloud Infrastructure"]
        SupaAuth["Supabase GoTrue Auth (JWT / Sessions)"]
        Postgres["Supabase PostgreSQL 15+ (With RLS)"]
        Storage["Supabase S3-Compatible Storage Buckets"]
        Realtime["Supabase Realtime Engine (WebSockets)"]
    end

    Browser["User Browser / Mobile PWA"] -->|HTTPS| Edge
    Edge --> NextSSR
    NextSSR -->|JWT Verification| SupaAuth
    NextSSR -->|SQL with RLS| Postgres
    NextSSR -->|Signed URLs| Storage
    Browser -->|Direct WebSockets| Realtime
    Browser -->|Download Media via Signed URLs| Storage
```

