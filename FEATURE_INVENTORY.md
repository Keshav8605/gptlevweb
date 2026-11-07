# Complete Feature Inventory & Route Mapping: GPTLevWeb

**Audit Date:** November 7, 2026  
**Auditor:** Senior Product Architect & Full-Stack Engineer  
**System:** GPTLevWeb Romantic Relationship Platform  
**Target Codebase:** `k:\keshavnewbranch\gptlevweb`

---

## 1. Feature Architecture Overview

GPTLevWeb is divided into three distinct operational domains:
1. **The Recipient Experience (The Romantic Gift):** Immersive, emotional, animated relationship web app delivered via dynamic route `/gift/[slug]` or standalone chapter routes `/story/*`.
2. **The Creator Experience (The Studio & Wizard):** 10-step wizard, section editor registry, live preview modal, media library, and analytics dashboard located at `/studio` and `/create`.
3. **The Shared Collaborative Space:** Interactive features where both partners participate: Notebook (shared journal), Date Planner (ideas, itineraries, proposals, memories), Voice Messages, and Content Reactions.

---

## 2. Complete Inventory of Discovered Features

### Category A: The Romantic Gift Experience (Recipient Realm)

| Feature Name | Route / Component | Backend / API File | Persistence Entity | Auth & Security | Implementation Status | Notes & Limitations |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Passcode Gate** | `src/app/gift/[slug]/page.tsx` | `POST /api/gifts/by-slug/[slug]` | `gifts.privacy.passcode` | Plaintext passcode verification; issues HMAC token | **PARTIALLY IMPLEMENTED** | Frontend token discard bug discards `unlockToken`. Lockout feedback missing. |
| **Welcome Experience** | `src/components/sections/WelcomeExperience.tsx` | `GET /api/gifts/by-slug/[slug]` | `gifts.welcome*` | Public/recipient | **COMPLETE AND VERIFIED** | Envelope flap animation, handwritten note, audio cue. |
| **Things I Noticed About You** | `src/components/sections/ObservationsSection.tsx` | `GET /api/interactions/comments` | `gifts.customObservations`, `comments`, `reactions` | Public read, token or spoofed mutation | **IMPLEMENTED, NOT SECURE** | Unauthenticated comments leakage; identity spoofing on post. |
| **Our Secret World** | `src/components/sections/SecretWorldSection.tsx` | `POST /api/secret/verify` | `src/lib/secret-world-store.ts` | Rate-limited (5 attempts, 30s cooldown) | **PARTIALLY IMPLEMENTED** | Secrets stored in in-memory JavaScript map (`configsByOwner`), resets on reboot. |
| **Memory Scrapbook** | `src/components/sections/MemoriesSection.tsx` | `GET /api/media` | `gifts.customMemories`, `gifts.memories*Collage` | Recipient unlock token | **COMPLETE AND VERIFIED** | Polaroid lightbox, zoom modal, tags. |
| **Music Experience (Our Song)** | `src/components/sections/OurSongSection.tsx` | Static / Client Web Audio | `gifts.featuredSong` | None | **COMPLETE AND VERIFIED** | Vinyl record rotation animation, Web Audio pentatonic chime synthesizer. |
| **Open When Letters** | `src/components/sections/OpenWhenSection.tsx` | Client State | `gifts.customOpenWhenLetters` | None | **COMPLETE AND VERIFIED** | Sealed envelope cards, modal reading drawer, mood stamps. |
| **Delulu Mode (Couple Quiz)**| `src/components/sections/DeluluSection.tsx` | Client State | `gifts.customDeluluScenarios` | None | **COMPLETE AND VERIFIED** | 6 relationship scenarios, humorous reactions, replay flow. |
| **Relationship Questionnaire**| `src/components/sections/QuizSection.tsx` | Client State | `gifts.customQuizQuestions` | None | **COMPLETE AND VERIFIED** | Multiple choice questions, side-by-side answer reveals. |
| **Love Letters Accordion** | `src/components/sections/LettersSection.tsx` | Client State | `gifts.customLetters` | None | **COMPLETE AND VERIFIED** | Drop-caps, date stamps, accordion expanders. |
| **100 Reasons Why I Love You**| `src/components/sections/LittleReasonsSection.tsx`| Client State | `gifts.customLittleReasons`, `reasons-data.ts` | None | **COMPLETE AND VERIFIED** | Random note picker without duplicates, bookmark drawer. |
| **Digital Romance Coupons** | `src/components/sections/DigitalGiftsSection.tsx` | Client State / LocalStorage | `gifts.customDigitalGifts` | LocalStorage tracking | **COMPLETE AND VERIFIED** | Claim vouchers, timestamp logging, duplicate claim prevention. |
| **Shared Notebook (Journal)** | `src/components/sections/NotebookSection.tsx` | `GET, POST /api/notebook` | `journalEntries` | Spoofable auth (`x-participant-token`) | **IMPLEMENTED, NOT SECURE** | Unauthenticated reading; anyone can read all couple journals. |
| **Voice Messages (Whispers)** | `src/components/sections/VoiceMessageSection.tsx`| `GET, POST /api/voice` | `voiceMessages` | Spoofable auth | **IMPLEMENTED, NOT SECURE** | Browser MediaRecorder API works; audio saved as Base64. |
| **Future Dreams (Bucket List)**| `src/components/sections/BucketListSection.tsx` | Client State | `gifts.customBucketListItems` | None | **COMPLETE AND VERIFIED** | Shortlisted and idea statuses, interactive toggles. |
| **Date Planner: Catalog** | `src/components/planner/DateIdeasCatalog.tsx` | `GET /api/dates/ideas` | `dateIdeas` | None | **COMPLETE AND VERIFIED** | 24 ideas across 8 categories, cost and duration filters. |
| **Date Planner: Preferences** | `src/components/planner/DatePlannerSection.tsx`| `GET, POST /api/dates/preferences` | `datePreferences` | Participant token | **COMPLETE AND VERIFIED** | 4-state mutual rating (`really_want`, `sounds_cute`, etc.). |
| **Date Planner: Proposals** | `src/components/planner/DateProposalsView.tsx` | `GET, POST /api/dates/proposals` | `dateProposals` | Participant token | **COMPLETE AND VERIFIED** | Surprise dates, multi-stop itineraries, state machine. |
| **Date Planner: Memories** | `src/components/planner/DateMemoriesGallery.tsx`| `GET, POST /api/dates/memories` | `dateMemories` | Public read | **IMPLEMENTED, NOT SECURE** | Completed date retrospective; unauthenticated reading. |
| **Anniversary Counter & Finale**| `src/components/sections/FinalHeartSection.tsx`| Client State | `gifts.dateOfficialCouple`, `gifts.final*` | None | **COMPLETE AND VERIFIED** | Live Days/Hours/Minutes/Seconds ticker, particle explosion. |

---

### Category B: The Creator Experience (Studio Realm)

| Feature Name | Route / Component | Backend / API File | Persistence Entity | Auth & Security | Implementation Status | Notes & Limitations |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Creator Authentication** | `/login`, `/signup` | Supabase Auth API | Supabase Auth `auth.users` | Supabase JWT session cookie | **COMPLETE AND VERIFIED** | Email/password sign-in and sign-up. |
| **Creator Dashboard** | `/studio`, `/dashboard` | `GET /api/gifts`, `GET /api/creator/responses` | `gifts`, `comments`, `journalEntries` | Supabase JWT verified | **COMPLETE AND VERIFIED** | Metrics summary, gift cards, unread response counters. |
| **Gift Creation Wizard** | `src/components/studio/GiftCreationWizard.tsx` | `POST /api/gifts` | `gifts` | Supabase JWT verified | **COMPLETE AND VERIFIED** | 10-step wizard: Basics, Dates, Welcome, Chapters, Media, Privacy. |
| **Section Editor Registry**| `src/components/studio/SectionEditorRegistry.tsx`| `PUT /api/gifts/[id]` | `gifts` | Supabase JWT verified | **COMPLETE AND VERIFIED** | Toggle chapters on/off, reorder, live inline editing. |
| **Media Library Modal** | `src/components/studio/MediaLibraryModal.tsx` | `GET /api/media`, `POST /api/media/upload`, `DELETE /api/media` | `mediaAssets` | Supabase JWT or Recipient Token | **COMPLETE AND VERIFIED** | 10MB file limit, MIME validation, thumbnail preview, insertion. |
| **Autosave Engine** | `src/app/studio/page.tsx` | `PUT /api/gifts/[id]` | `gifts` | Supabase JWT verified | **COMPLETE AND VERIFIED** | 2-second debounced autosave with visual status indicators. |
| **Live Device Preview** | `src/components/studio/LivePreviewModal.tsx` | Client State Simulation | None | Creator only | **COMPLETE AND VERIFIED** | Desktop and iPhone mobile frame simulator. |
| **Publishing Controls** | `src/components/studio/PublishModal.tsx` | `POST /api/gifts/[id]/publish` | `gifts.status`, `publishedAt` | Supabase JWT verified | **COMPLETE AND VERIFIED** | Instant publish/unpublish, custom slug validation. |
| **Gift Deletion** | `src/app/studio/page.tsx` | `DELETE /api/gifts/[id]` | `gifts`, cascades related records | Supabase JWT verified | **COMPLETE AND VERIFIED** | Cleans up attached comments, reactions, proposals. |

---

## 3. Discovered Missing, Mock, or Broken Features

1. **User Profile Management (`/profile`, `/settings`):**
   - **NOT IMPLEMENTED.** No profile page exists. No `profiles` table exists.
2. **Account Deletion / GDPR Wipe:**
   - **NOT IMPLEMENTED.** No API or UI button exists to delete a user account and wipe all uploaded photos.
3. **Password Reset / Email Recovery:**
   - **NOT IMPLEMENTED.** Login screen lacks a "Forgot Password" flow.
4. **Cloud Object Storage for Media:**
   - **NOT IMPLEMENTED.** All files are encoded into Base64 strings inside the local JSON file.
5. **Real-time Push Notifications:**
   - **MOCK IMPLEMENTATION.** Notifications are stored in `dateNotifications` array; there is no WebSockets or Supabase Realtime channel. Updates require manual client refresh or polling.

