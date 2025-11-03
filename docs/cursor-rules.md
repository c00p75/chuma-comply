# **Chuma Comply: AI Coding Strategy & Rules**

This document is our high-level strategy for using an AI coding assistant (Cursor) to build the "Chuma Comply" project.

**Our Goal:** To execute the "Project Plan" and achieve an "Exceptional" (Level 4-5) score on the "Hytel AI Coding Bootcamp Rubric".

**Core Philosophy: The 80/20 AI-Human Partnership**

* **Cursor's Job (80%):** Write boilerplate, generate components, implement plumbing, write unit tests, refactor code, and set up CI/CD files.  
* **Your Job (20%):** Act as the architect. Make high-level decisions, lead the integration, define the complex RAG logic, and verify the final quality.

## **Phase 1 & 2: Frontend Foundation (The "Crawl" & "Walk")**

*Objective: Build a 100% functional front-end based on mock data. (Targets Rubric: "Design", "Frontend Implementation", "Quality & Testing", "Architecture")*

### **Rule 1.1: Start with the "Genesis Prompt"**

Use the chuma-comply-prompt-v2.md file as your first instruction to Cursor. This will generate the entire file structure and component foundation in one go.

### **Rule 1.2: Refactor Immediately (The "Human Architect" Rule)**

The AI will generate large files (like ChatView.tsx). Your *first* follow-up prompt must be to refactor. This directly targets the "Modular components" and "Large components" rubric items.

* **Prompt Example:** "This ChatView.tsx is too large. Refactor it.  
  1. Create a new components/ChatInput.tsx and move the form and input logic there.  
  2. Create a new components/MessageList.tsx and move the messages.map logic there.  
  3. Create a new components/Welcome.tsx for the welcome screen and prompt-starter cards."

### **Rule 1.3: Test As You Go (The "Test Coverage" Rule)**

Do not wait until the end to write tests. After Cursor builds a component, your *next* prompt must be to test it. This is the only way to hit the "≥60% coverage" rubric goal.

* **Prompt Example:** "Write unit tests for the Checklist.tsx component using Vitest and React Testing Library.  
  1. Ensure it renders the title correctly.  
  2. Ensure it renders the correct number of steps.  
  3. Ensure it renders the source for each step."

### **Rule 1.4: Verify Accessibility & Polish (The "A11y" Rule)**

The "Genesis Prompt" *asks* for accessibility, but you must *verify* it.

* **Prompt Example:** "Audit Sidebar.tsx for accessibility.  
  1. Ensure all buttons are keyboard-navigable.  
  2. Ensure the active tab has the correct aria-current="page" attribute.  
  3. Add focus-visible rings to all buttons."

### **Rule 1.5: Add Polish, Performance, and Error Toasts (The "L5 Polish" Rule)**

The rubric rewards a "pixel-perfect" app with "motion" and "exhaustive error states." We will prompt for this *after* the initial components are built. This targets **Design L5** and **Frontend L4/L5**.

* **Prompt Example (Motion):** "Add UI polish to the MessageList.tsx component.  
  1. Install and use framer-motion.  
  2. Make new messages animate in (e.g., fade in and slide up slightly).  
  3. When the isLoading state is true, show a "skeleton" loading component instead of just text."  
* **Prompt Example (Performance):** "Optimize the Checklist.tsx and MessageList.tsx components for performance. Wrap them in React.memo to prevent unnecessary re-renders when the parent component's state (like the chat input text) changes."  
* **Prompt Example (Error States):** "Install react-hot-toast. In the chatStore.ts, when the API call fails, don't just log to the console. Call toast.error() with the user-friendly error message so a global notification appears. This hits the 'exhaustive error states' rubric item."

### **Rule 1.6: Create Architecture Decision Records (The "L5 Architecture" Rule)**

The rubric's L5 for Architecture mentions an "exemplary ADR trail." We will start this now.

* **Prompt Example:** "Create a /docs/adr folder.  
  1. Add a new file 001-frontend-stack-selection.md.  
  2. In it, write a brief ADR explaining our decision to use Vite (for speed), Zustand (for simple global state over Redux), and Tailwind (for utility-first styling).  
  3. Add another file 002-state-management.md explaining why we chose Zustand to manage chat state instead of local component state (to decouple UI from logic and anticipate auth)."

## **Phase 3: Backend RAG Logic (The "Run")**

*Objective: Build and connect the "smart" RAG backend. (Targets Rubric: "Backend / API", "Security", "Architecture", "Product Management")*

### **Rule 2.1: Initialize the Backend**

Use Cursor to set up the backend file structure.

* **Prompt Example:** "Initialize Firebase for this project. Add a new Firebase Cloud Function in Python named api/comply.  
  1. Install firebase-admin, google-cloud-aiplatform, and flask.  
  2. Create an api/prompts.py file. Add a constant GEMINI\_SYSTEM\_PROMPT and move the full system prompt from our project plan into it.  
  3. Create an api/config.py file to handle environment variables."

### **Rule 2.2: Lead the "Smart Logic" (The "Human-Led RAG" Rule)**

This is the most important rule. Cursor *cannot* invent your project's core "Smart RAG" logic from the project plan. You must *feed* it the logic.

* **Bad Prompt:** "Build the RAG backend." (Too vague, will fail).  
* **Good Prompt:** "In my Python Cloud Function api/comply, I need to implement the 'Smart RAG' logic:  
  1. Import GEMINI\_SYSTEM\_PROMPT from api.prompts.  
  2. First, get the user's query from the request body.  
  3. Perform simple entity extraction: if 'data' or 'email' is in the query, set an activity variable to 'data\_processing'.  
  4. Next, call the Vertex AI Vector Search endpoint. Use the filter parameter to search for topic=='Tax' OR topic=='Registration' OR activity\_relevance==\[activity\].  
  5. Get the top 5 chunks and pass them to the Gemini API, using the imported GEMINI\_SYSTEM\_PROMPT.  
  6. Ensure the final response is formatted as the JSON that matches our Zod schema."

### **Rule 2.3: Secure the API (The "Security" Rule)**

The rubric explicitly grades "Firestore rules" and "Security." Prompt for this directly.

* **Prompt Example:** "Secure my api/comply Cloud Function.  
  1. Add a check at the beginning of the function to ensure the user is authenticated (check context.auth). If not, return a 401 Unauthorized error.  
  2. Now, write the firestore.rules to enforce the 'Principle-of-least-privilege'. Users should only be able to read/write their *own* chat messages."

### **Rule 2.4: Implement Advanced Analytics (The "L5 Data-Driven" Rule)**

The rubric's L5 for Product Management requires "Data-driven decisions." We will log the *cost and performance* of our AI.

* **Prompt Example:** "In my api/comply Cloud Function, after I get a *successful* response from Gemini:  
  1. Add a log event to Firebase Analytics.  
  2. Log a custom event named compliance\_request\_success.  
  3. Include parameters for:  
     * activity (e.g., 'data\_processing', 'registration')  
     * gemini\_latency\_ms (the duration of the Gemini API call)  
     * gemini\_token\_count (the token count from the Gemini response)  
       This gives us data on what users ask for, how fast it is, and how much it costs."

### **Rule 2.5: Set Up Zod-Validated Config (The "L5 Backend" Rule)**

This targets "Multi-env config" (L5) and "Dev Experience" (L4/L5) by ensuring our app fails fast if configuration is missing.

* **Prompt Example (Frontend):** "Create a src/lib/env.ts file. Use Zod to validate all VITE\_ environment variables (like VITE\_FIREBASE\_CONFIG). Parse import.meta.env and export the validated env object. This ensures the app fails fast on boot if the config is wrong."  
* **Prompt Example (Backend):** "In api/config.py, use os.environ.get() to load and validate environment secrets (like VERTEX\_AI\_KEY). If a key is missing, the function should log a critical error and fail immediately."

  ### **Phase 3: Backend RAG Logic (The "Run")**

*Objective: Build the "Advanced Vision" (the real RAG pipeline) and implement the "paywall" logic. (Targets Rubric: "Backend / API", "Architecture", "Security", "Product Management")*

**This phase is split by language. We are using a "polyglot" architecture.**

* **Python:** For the "Ingestion Pipeline" (data processing).  
* **TypeScript (tRPC):** For the "RAG API" (real-time user queries).

  #### **Part A: The Ingestion Pipeline (Python)**

*This is **Rule 2.1**, the "Smart Library" builder.*

### **Rule 2.1: Build the Ingestion Function (Python)**

The TDD requires a Python function to build our vector database in Firestore.

* **Prompt Example:** "Create a new Firebase Cloud Function in Python, located in the `/services/ingestion` folder. This function must:  
  1. Be named `ingestDocument`. It should be a manually-triggerable HTTP function.  
  2. It must accept a JSON body with `{ "fileName": "doc.pdf", "subscriptionTier": "free" | "pro", "metadata": { ... } }`.  
  3. **Step 1:** Read the specified `fileName` from a GCS (Firebase Storage) bucket.  
  4. **Step 2 (Chunking):** Use the `unstructured.io` library to parse the PDF. Iterate through the elements to create "content-aware" chunks (as defined in our TDD).  
  5. **Step 3 (Embed & Store):** For each chunk:  
     * Call the Vertex AI Embedding API (`text-embedding-005`) to get its vector.  
     * Create a new document in the `vectorChunks` collection.  
     * Save the `chunkText`, the `embedding`, and all metadata: `sourceDocument`, `sourcePage`, `metadata` (from the request), and **`subscriptionTier`** (from the request).  
  6. Log the total number of chunks processed."

     #### **Part B: The RAG API (TypeScript / tRPC)**

*This is **Rule 2.2**, the "Smart Logic" builder.*

### **Rule 2.2: Build the Subscription-Aware RAG API (tRPC)**

This is the core of our "Advanced Vision" and our monetization strategy, as defined in the TDD.

* **Prompt Example:** "Create a new tRPC router `rag.ts` in the `/packages/api-trpc` folder. It must have one procedure: `getComplianceChecklist`. This procedure must:  
  1. Be a **protected procedure** (user must be authenticated).  
  2. Accept a Zod input: `z.object({ query: z.string() })`.  
  3. **Step 1 (Get User Tier):** Get the user's `uid` from the context. Fetch their `UserProfile` from Firestore to get their `subscriptionTier` and `businessDescription`.  
  4. **Step 2 (Intent Analysis):** Send the `query` \+ `businessDescription` to Gemini (Function Calling) to extract structured filter entities (e.g., `industry: 'food-service'`, `activity: 'employment'`).  
  5. **Step 3 (Metadata Filtering):** Construct a dynamic Firestore query for `vectorChunks`. Filter by the entities from Step 2 (e.g., `where('metadata.industry', '==', 'food-service')`). Always include 'general' chunks.  
  6. **Step 4 (In-Memory Search):**  
     * Fetch the candidate chunks (e.g., max 500\) from Firestore.  
     * Generate an embedding for the user's `query`.  
     * Run **in-memory cosine similarity** inside the tRPC function to find the Top-K (e.g., Top 5\) most relevant chunks.  
  7. **Step 5 (Paywall Check \- CRITICAL):**  
     * Check the metadata of the Top-5 chunks.  
     * **If `user.subscriptionTier == 'free'` AND `any` chunk has `chunk.subscriptionTier == 'pro'`:**  
       * Throw a specific `TRPCError` with the code `PAYMENT_REQUIRED` and a message like 'I found industry-specific guidance. Upgrade to Pro to unlock this answer.'  
  8. **Step 6 (Final Generation):**  
     * If the paywall check passes, format the Top-5 chunks as context.  
     * Send the context \+ query to Gemini with a strong system prompt (from `api/prompts.ts`) to generate the user-readable, cited checklist.  
  9. Return the final string response."

     ### **Rule 2.3: Implement AI Analytics (The "L5 Data-Driven" Rule)**

The L5 rubric requires "Data-driven decisions." We will log AI metrics.

* **Prompt Example:** "In the `rag.getComplianceChecklist` tRPC procedure, after a *successful* Gemini call (Step 6):  
  1. Extract the `tokenCount` and `latency` from the Gemini response/headers.  
  2. Log a custom event to Firebase Analytics named `rag_success`.  
  3. Include parameters for `user_tier` (e.g., 'free' or 'pro'), `token_count`, and `gemini_latency_ms`."

     ### **Rule 2.4: Set Up Zod-Validated Env Vars (The "L5 Backend" Rule)**

The L5 rubric requires "Multi-env config" and "DevEx." We will validate our secrets.

* **Prompt Example:** "Create a `config.ts` file for the `api-trpc` package.  
  1. Use Zod to create a schema for all required server-side environment variables (e.g., `VERTEX_AI_PROJECT_ID`, `GEMINI_API_KEY`).  
  2. Parse `process.env` against this schema.  
  3. If any variable is missing, the app should fail fast on boot with a clear error."  
* **Prompt Example (Python):** "Do the same for the Python `ingestion` service. Create a `config.py` that loads and validates environment secrets. If a key is missing, the function should log a critical error and fail immediately."

  ### **Rule 2.5: Create an ADR (The "L5 Architecture" Rule)**

The L5 rubric explicitly rewards an "exemplary ADR trail."

* **Prompt Example:** "Create a new file `docs/adr/002-polyglot-backend.md`.  
  * **Title:** 'ADR 002: Use Polyglot (TypeScript/Python) Backend'  
  * **Context:** 'We need a user-facing API and a data-processing ingestion pipeline.'  
  * **Decision:** 'We will use TypeScript (tRPC) for the user-facing API to get end-to-end type safety. We will use Python for the ingestion pipeline to leverage its superior data science libraries (like `unstructured.io`).'  
  * **Consequences:** 'This increases monorepo complexity but ensures we use the best tool for each job, improving developer velocity and pipeline reliability.'"  
  


## **Phase 4: Testing, Polish & Deployment**

*Objective: Create a production-grade, demonstrable app. (Targets Rubric: "Dev Experience", "Lighthouse", "E2E Testing", "Quality")*

### **Rule 3.1: Write AI Regression Tests (The "L5 Quality" Rule)**

This expands on the Playwright rule to test for "prompt regressions," a key part of AI engineering.

* **Prompt Example:** "Create a Playwright test chat.spec.ts for the 'Grace' (digital agency) user story.  
  1. Assert that the text 'Data Protection Act, 2021' is visible.  
  2. Now, create a *second* test, bakery.spec.ts, for a 'bakery' user story.  
  3. Assert that it *does not* show the Data Protection Act but *does* show 'Food Safety Act'.  
  4. When we tune the prompt for 'Grace', we will run *both* tests to ensure we didn't break the 'bakery' logic."

### **Rule 3.2: Optimize for Production (The "Lighthouse" Rule)**

The rubric mentions "lighthouse \~90+". This means performance. This targets **Frontend L5**.

* **Prompt Example:** "My app is loading slowly. Analyze the App.tsx component. Use React.lazy and Suspense to code-split the KnowledgeBaseView component so it only loads when clicked."

### **Rule 3.3: Set Up CI/CD with Lighthouse (The "L5 CI" Rule)**

The rubric grades this heavily. We will add Lighthouse checks directly to CI.

* **Prompt Example:** "Create a GitHub Actions workflow file .github/workflows/deploy.yml. It must:  
  1. Run on push to the main branch.  
  2. Set up Node.js and pnpm.  
  3. Install dependencies.  
  4. Run pnpm lint, pnpm test:unit, and pnpm build.  
  5. **Add a new step:** Run a Lighthouse check. Fail the build if the performance score is below 0.9.  
  6. If all pass, deploy the dist folder to Firebase Hosting."

### **Rule 3.4: Automate Dev Experience (The "L5 DevEx" Rule)**

The rubric has high-value items for Dev Experience that we can fully automate. This targets **Dev Experience L4/L5** and **Quality L4**.

* **Prompt Example:** "Set up advanced developer experience tools for this project.  
  1. Install husky and set up a pre-commit hook.  
  2. Make the pre-commit hook run pnpm lint and pnpm test:unit.  
  3. Install Storybook for React.  
  4. Create a new Storybook file Checklist.stories.tsx and create a default story for the Checklist.tsx component using its mock data."