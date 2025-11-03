  
TECHNICAL DESIGN DOCUMENT TEMPLATE  
MY BENEFIT  
One‑sentence pitch: Chuma Comply is an AI-powered legal co-pilot designed to make business compliance in Zambia simple, instant, and accessible.

ChumaComply

1\. OVERVIEW

\* Goal: 

* Solve the overwhelming complexity of Zambia's fragmented regulatory landscape (PACRA, ZRA, NAPSA, etc.) for new businesses.  
* Prevent costly fines, critical delays, and business failures that result from simple compliance mistakes.  
* Transform weeks of legal confusion into a simple, 2-minute conversation, removing compliance as a major barrier to entrepreneurship.

\* Key features:

* An AI-powered legal co-pilot that understands plain English business descriptions.  
* A RAG (Retrieval-Augmented Generation) system that reasons with Zambia's ingested regulatory framework.  
* Instant generation of a personalized, step-by-step compliance checklist.  
* Every step is automatically cited back to the specific law or regulation.

\* Target users & success criteria: 

* Target Users: Zambian entrepreneurs and new business owners who are experts in their field but not in legal compliance.  
* Success Criteria: Measured by positive user feedback, user growth and retention, and a quantifiable reduction in the average "time-to-compliance" for a new business.

\---

### **2\. TECH STACK (GOLDEN PATH)**

This project uses a "polyglot" (multi-language) architecture to leverage the best tool for each job.

| Component | Technology | Rationale (Targets Rubric) |
| ----- | ----- | ----- |
| **Runtime (API)** | **Node.js 20+** (on Firebase Cloud Functions) | **TypeScript:** End-to-end type safety. (L4/L5) |
| **Runtime (Ingestion)** | **Python 3.11** (on Firebase Cloud Functions) | **Python:** Access to best-in-class data/AI libs (`unstructured.io`). |
| **Language** | TypeScript (strict), Python (with typing) | Polyglot approach uses the best tool for each job. |
| **Monorepo** | pnpm \+ Turborepo | Manages multiple services (`web`, `api-trpc`, `ingestion`) efficiently. (L4) |
| **Framework** | React (Vite) \+ tRPC | Fast HMR (Vite) \+ typesafe API client (tRPC). (L4) |
| **UI** | Tailwind CSS \+ shadcn/ui \+ Radix | Modern, accessible, utility-first styling. (L5) |
| **State (Client)** | **Zustand** | Simple, hook-based global state (e.g., mobile menu). |
| **State (Server)** | **TanStack Query v5** | Handles tRPC data fetching, caching, and mutations. (L4) |
| **Database** | **Firestore (Native Mode)** | Core app data \+ **Vector DB** (cost-effective "Option B"). (L4) |
| **Auth** | Firebase Authentication (Google) | Secure, managed, and easy to integrate. (L3) |
| **Testing** | Vitest \+ Playwright \+ Storybook | Unit, E2E, and component-driven testing. (L4/L5) |
| **CI/CD** | GitHub Actions \+ Firebase Hosting | Automated testing and deployment. (L4/L5) |

\---

3\. MONOREPO LAYOUT (PNPM)

.  
├── apps/  
│   └── web/            ← React front‑end (+ .storybook)  
├── functions/          ← Cloud Functions / tRPC routers  
├── packages/  
│   ├── shared/         ← Zod schemas, utilities, common types  
│   └── seeding/        ← Data‑seeding helpers (Firestore emulator/Admin SDK)  
├── docs/               ← Project docs (this TDD, ADRs, API notes)  
└── .github/            ← CI workflows

\---

### **4\. RAG, DATA & WORKFLOWS**

This section defines the data flow and logic for all product tiers.

#### **4.1. Data Model (Firestore)**

Our database model is built to support the three product tiers.

* **`users/{userId}`**  
  * `email`: (string) User's email.  
  * `displayName`: (string) User's name.  
  * `businessName`: (string) From onboarding.  
  * `businessDescription`: (string) From onboarding.  
  * `hasCompletedOnboarding`: (boolean)  
  * `subscriptionTier`: (string) **`'free'`, `'pro'`, or `'enterprise'`**.  
* **`vectorChunks/{chunkId}`**  
  * `sourceDocument`: (string) e.g., "Data\_Protection\_Act\_2021.pdf"  
  * `documentType`: (string) e.g., "data\_protection", "tax", "employment"  
  * `industry`: (string) e.g., "general", "food\_service", "mining"  
  * `subscriptionTier`: (string) **`'free'` or `'pro'`**. (All "general" docs are 'free', all industry-specific docs are 'pro').  
  * `content`: (string) The text chunk.  
  * `embedding`: (array\<number\>) The vector embedding.  
  * `page`: (number) Page number.  
* **`submissions/{submissionId}`** (NEW: For "Enterprise" Tier)  
  * `userId`: (string) Links to the user.  
  * `workflowType`: (string) e.g., "PACRA\_NAME\_RESERVATION"  
  * `status`: (string) e.g., "draft", "submitted", "query", "approved"  
  * `formData`: (map) The user-filled form data.  
  * `submittedAt`: (timestamp)  
  * `updatedAt`: (timestamp)  
* **`userDocuments/{documentId}`** (NEW: For "Enterprise" Tier)  
  * `userId`: (string) Links to the user.  
  * `submissionId`: (string) Links to the submission.  
  * `storagePath`: (string) The path to the file in Firebase Storage.  
  * `documentType`: (string) e.g., "director\_nrc", "proof\_of\_address"  
  * `uploadedAt`: (timestamp)

#### **4.2. Ingestion Pipeline (Python Cloud Function)**

This is the offline, "Pro-Aware" data pipeline that builds our "Smart Library".

1. **Trigger:** Manual (or on file upload to a GCS bucket).  
2. **Extract & Chunk:** Load a source PDF (e.g., "Food\_Safety\_Act.pdf") from the `/corpus` folder. Use the **`unstructured.io`** library to parse it into "content-aware" chunks (by `Header`, `Title`, etc.).  
3. **Generate Metadata:** For each chunk, create a metadata object. **Crucially, assign the `subscriptionTier`** based on the document (e.g., "Data Protection Act" is `'free'`, "Food Safety Act" is `'pro'`).  
4. **Embed & Store:** For each chunk, call the Vertex AI embedding model. Store the `content`, `metadata`, and `embedding` vector as a new document in the `vectorChunks` collection in Firestore.

#### **4.3. Query-Time RAG API (TypeScript tRPC) \- Free & Pro**

This is the real-time API for the chatbot, designed with the paywall logic.

1. **Auth & Get User:** Get the `userId` from Firebase Auth. Fetch the user's `subscriptionTier` from their `users/{userId}` document.  
2. **Intent Analysis (Step 1):** Take the user's query ("I'm opening a bakery") and call Gemini.  
   * **Prompt:** "Analyze this business description. Extract `industry`, `activities`, and `location`."  
   * **Output:** `{ industry: "food_service", activities: ["employment", "tax"] }`  
3. **Metadata Filtering (Step 2):** Run a *broad* Firestore query to get *all* potentially relevant documents (e.g., `WHERE documentType IN ('general', 'employment', 'tax') OR industry == 'food_service'`).  
4. **In-Memory Search (Step 3):**  
   * Generate an embedding for the user's original query.  
   * Load *only* the vectors from the filtered documents into the function's memory.  
   * Run a cosine similarity search *in-memory* to find the **Top 5** most relevant chunks.  
5. **Paywall Check (Step 4):**  
   * Check the metadata of the Top 5 chunks.  
   * **Case A (Free Answer):** If *all 5 chunks* have `subscriptionTier: 'free'`, proceed to Step 6\.  
   * **Case B (Upsell):** If *any* chunk has `subscriptionTier: 'pro'` AND the `user.subscriptionTier == 'free'`:  
     * **STOP.** Do not proceed.  
     * Return a special message: `{ type: "upsell", message: "I found 3 industry-specific guides for you. Upgrade to Pro to see them." }`  
6. **Final Generation (Step 5):**  
   * If the paywall check passed, provide all 5 chunks (text \+ sources) to Gemini.  
   * **System Prompt:** "You are Chuma Comply. Use the \[CONTEXT\] to provide a simple, user-readable checklist to answer the \[QUERY\]. You MUST cite your sources."  
   * Return the final, helpful answer to the user.

#### **4.4. Enterprise Workflows API (TypeScript tRPC) \- Enterprise**

This is a separate set of tRPC routers that power the "Enterprise" tier. This logic is *not* part of the RAG chat.

* `submission.create`: Creates a new `submissions` document (e.g., `workflowType: 'PACRA_NAME_RESERVATION'`).  
* `submission.update`: Updates the `formData` for a draft submission.  
* `submission.list`: Lists all submissions for a user.  
* `userDocument.getUploadUrl`: Gets a secure Firebase Storage signed URL for the user to upload a file (e.g., "director\_nrc.pdf").  
* `userDocument.onUploadFinalized`: A (future) Cloud Function trigger that links the uploaded file to the user and their submission.

\---

5\. DATA MODEL

| Entity | Key fields          | Notes             |  
| \------ | \------------------- | \----------------- |  
| User   | uid, email, role, … | Auth via Firebase |  
| \\\[…\]   | …                   | …                 |

\* Security rules: \\\[plan or link\]  
\* Index strategy: \\\[composite indexes\]

\---

6\. API DESIGN (tRPC)

| Router | Procedure | Input (Zod schema) | Output |  
| \------ | \--------- | \------------------ | \------ |  
| user   | getById   | uid                | User   |  
| \\\[…\]   | …         | …                  | …      |

Error‑handling conventions: \\\[auth errors, validation errors, etc.\]

\---

7\. TESTING STRATEGY

| Level / focus        | Toolset                                | Scope                      |  
| \-------------------- | \-------------------------------------- | \-------------------------- |  
| Unit                 | Vitest                                 | Pure functions, hooks      |  
| Component            | Vitest \+ Testing Library               | React components           |  
| Visual / interaction | Storybook \+ @storybook/testing‑library | UI snapshots, interactions |  
| End‑to‑end           | Playwright                             | Auth flows, happy paths    |

\* Coverage target: \\\[e.g., 80 % statements\]  
\* Fixtures / seeding: \`pnpm seed\` → runs scripts in \`packages/seeding\` against the Firebase emulator.

\---

8\. CI / CD PIPELINE (GITHUB ACTIONS)

9\. Setup PNPM and restore Turbo remote cache

10\. \`pnpm exec turbo run lint typecheck\` – ESLint & \`tsc \--noEmit\`

11\. \`pnpm exec turbo run test\` – Vitest (Turbo skips untouched packages)

12\. \`pnpm exec turbo run build-storybook\` – generates static Storybook

13\. \`pnpm exec turbo run e2e\` – Playwright suite (headless)

14\. Deploy preview (Firebase Hosting channel \+ optional Storybook host)

15\. Changesets release & promote to prod on merge to \`main\`

\---

9\. ENVIRONMENTS & SECRETS

| Env        | URL / target                                       | Notes                                          |  
| \---------- | \-------------------------------------------------- | \---------------------------------------------- |  
| local      | localhost:5173                                     | .env \+ Firebase emulators; validated by T3 Env |  
| preview-\\\* | Firebase Hosting channel                           | Auto‑created per PR                            |  
| prod       | \[https://app.example.com\](https://app.example.com) | Promote via CI workflow                        |

Secrets handled with \`firebase functions:config:set\` and GitHub repo secrets.

\---

10\. PERFORMANCE & SCALABILITY

\* Denormalize Firestore data to avoid hot‑document writes.  
\* Tune TanStack Query caching (\`staleTime\`, prefetch patterns).  
\* Code‑split via Vite dynamic imports.

\---

11\. MONITORING & LOGGING

| Concern        | Tool                          | Notes                   |  
| \-------------- | \----------------------------- | \----------------------- |  
| Runtime errors | Firebase Crashlytics / Sentry | Front‑end error capture |  
| Server logs    | Google Cloud Logging          | Structured JSON logs    |  
| Analytics      | GA4 or PostHog                | Track funnels & usage   |

\---

12\. ACCESSIBILITY & I18N

\* shadcn/ui components use Radix primitives (focus, ARIA).  
\* Storybook a11y addon for quick audits.  
\* WCAG 2.1 AA checklist (contrast, keyboard nav).  
\* i18n plan: \\\[react‑intl, language switcher, etc.\]

\---

13\. CODE QUALITY & FORMATTING

\* Prettier formats on save / commit.  
\* ESLint governs rules; perfectionist plug‑in auto‑sorts imports and object keys.  
\* Husky pre‑commit hook runs \`lint-staged\`.

\---

14\. OPEN QUESTIONS / RISKS

| Item                     | Owner | Resolution date |  
| \------------------------ | \----- | \--------------- |  
| \\\[e.g., Payment gateway\] | —     | —               |  
| \\\[…\]                     |       |                 |

\---

15\. APPENDICES

\* Setup script: \`pnpm exec turbo run setup\`  
\* Branching model: Conventional commits \+ Changesets for versioning.  
\* Links: product spec, Figma, Storybook URL, ADR index, etc.

\---

Last updated: 2025‑10‑30

