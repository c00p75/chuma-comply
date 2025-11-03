### **Chuma Comply: De-risking Zambian Entrepreneurship**

**The Problem:** Zambia's entrepreneurial spirit is booming. However, the single biggest barrier for a new business isn't just capital \- it's the compliance maze. The regulatory landscape is fragmented across PACRA, ZRA, NAPSA, local councils, and industry-specific acts. A simple mistake in this process leads to costly fines, critical delays, or causes the business to fail before it even starts.

**The Solution:** Chuma Comply is an AI-powered legal co-pilot designed to make business compliance in Zambia simple, instant, and accessible.

We are turning weeks of legal confusion into a 2-minute conversation.

The App Concept (How it Works):

Chuma Comply is built on a sophisticated RAG (Retrieval-Augmented Generation) system. We have ingested and indexed Zambia's entire regulatory framework \- the Companies Act, the Employment Code, ZRA tax guides, the Data Protection Act, and more.

Our AI doesn't just *search* this data; it *reasons* with it. A user describes their business in plain English, and our system instantly generates a personalized, step-by-step compliance checklist, with every single step **cited back to the specific law or regulation.**

### **User Story: Meet Grace**

* **Who:** Grace, a talented software developer in Lusaka starting her first digital agency.

* **The Problem:** She’s an expert in code, not compliance. She's worried: "Do I need to register for VAT immediately? How does the Data Protection Act affect me? What are my NAPSA obligations for my first two employees?" The cost of a lawyer is a major barrier.

* **The "Chuma Comply" Moment:** Grace opens the app and types: *"I'm starting a digital marketing agency in Lusaka with 2 employees and will be collecting client email data."*

* **The Outcome:** Instantly, Chuma Comply generates her complete roadmap:  
  1. **Business Registration:** Register your business name with PACRA *(Source: Business Names Act, Sec. 5\)*.  
  2. **Tax Registration:** Get your Taxpayer ID (TPIN) from ZRA *(Source: ZRA TPIN Guide)*.  
  3. **Labor Compliance:** Register for NAPSA and WCFCB for your 2 employees *(Source: NAPSA Act, Sec. 10\)*.  
  4. **Data Privacy:** You MUST register with the Data Protection Commissioner as you are processing personal data *(Source: Data Protection Act, 2021, Sec. 40\)*.  
  5. **Local Licensing:** Apply for a Business Levy from Lusaka City Council *(Source: Local Government Act)*.

Grace doesn't just feel compliant; she feels **confident, secure, and ready to launch.**

### **Use Cases & Market Opportunity**

This is more than just a B2C app; it's critical infrastructure for the entire SME ecosystem.

1. **The Entrepreneur (B2C):** The primary user. A freemium or low-cost subscription model provides individual entrepreneurs (like Grace) with direct, affordable legal guidance.  
2. **The SME Enabler (B2B Partnership):**  
   * **Banks & Financial Institutions:** Embed Chuma Comply as a value-add for their business banking clients. This de-risks their SME loan portfolio by ensuring their clients are compliant and less likely to fail.  
   * **Startup Hubs & Accelerators:** Offer Chuma Comply as a core resource to their cohorts, increasing their startups' speed to market and long-term viability.  
3. **The Investor & Professional (B2B Partnership):**  
   * **Venture Capital & Angel Investors:** Use the app to perform rapid, automated due diligence on a potential investment's regulatory standing.  
   * **Law & Accounting Firms:** Use the app internally to automate 80% of their associates' research, allowing them to focus on high-value strategic advice rather than basic compliance lookups.

**The Vision:** Chuma Comply will become the digital front-door for Zambian entrepreneurship. We are seeking partners and investors to help us build this essential tool and accelerate the growth of the entire SME ecosystem.

## 

## **Project Plan: Chuma Comply RAG System** 

### **I. Project Objective & Core Function**

* **Project:** Chuma Comply (RAG System)  
* **Objective:** To build an AI assistant that provides entrepreneurs in Zambia with accurate, actionable, and citable compliance checklists for starting a new business.  
* **Core User Flow:**  
  1. **User Input:** The user describes their intended business in natural language (e.g., "I want to start a small restaurant in Lusaka with 3 employees," or "I'm launching a digital marketing agency that will collect customer data").  
  2. **RAG System Analysis:** The system identifies key compliance-triggering entities (business type, location, employee count, data handling, etc.).  
  3. **System Output:** The RAG system generates a step-by-step checklist of regulatory requirements, including registrations, licenses, and contributions, with direct citations to the relevant Zambian laws or guides.

### **II. RAG System Architecture**

This architecture is designed for **precision filtering** and **traceability**, which are critical for a legal application.

1. **Query Pre-processing (The "Brain"):**  
   * This is an advanced RAG technique. Instead of just embedding the raw query, a "Query Router" or "Function-Calling Model" first analyzes the user's text.  
   * **Entity Extraction:** It extracts a structured JSON object from the query.  
     * *Query:* "I'm starting a bakery in Kitwe with 2 staff."  
     * *Extracted JSON:* { "business\_type": "Food Service", "location": "Kitwe", "employees": 2, "activities": \["food\_preparation", "retail\_sales"\] }  
   * **Intent Mapping:** This JSON object is then mapped to the primary legal topics that must be queried: Business Registration, Tax, Employment, Health & Safety, Local Council.  
2. **Retrieval Strategy (Hybrid & Filtered):**  
   * **A. Metadata Filtering (First Pass):** The system uses the extracted entities to perform a *strict metadata filter* on the vector database *before* any semantic search. This drastically narrows the search space to only the most relevant documents.  
   * **B. Hybrid Search (Second Pass):** Within that filtered set, the system performs a hybrid search:  
     * **Vector Search:** Finds semantically similar concepts (e.g., "hiring people" maps to "Employment Code Act").  
     * **Keyword Search (BM25):** Finds exact acronyms and legal terms (e.g., "PAYE," "NAPSA," "PACRA").  
   * **C. Re-Ranking:** The top 20-30 results from the hybrid search are passed to a **Re-ranker Model** (e.g., Cohere Re-rank). This model's *only* job is to re-sort the results for maximum relevance, pushing the most critical compliance steps to the top.  
3. **Augmentation & Generation:**  
   * **Context Stuffing:** The top 5-7 re-ranked chunks are compiled into the context window.  
   * **Prompt Engineering:** A highly-specific **System Prompt** instructs the LLM on its role, limitations, and output format.  
   * **LLM Generation:** The LLM synthesizes the final checklist, strictly adhering to the prompt.  
4. **Post-processing & Citations:**  
   * The system parses the LLM's output to ensure every checklist item has a corresponding citation, which is automatically extracted from the metadata of the chunks used.

### **III. Knowledge Base (KB) Design & Ingestion**

This is the most critical component. The quality of the KB determines the quality of the app.

#### **A. Data Sources**

| Regulatory Body | Documents to Ingest | Availability Score |
| :---- | :---- | :---- |
| **PACRA** | Companies Act, Business Names Act, official registration guides, fee schedules. | 5/5 |
| **ZRA** | Income Tax Act, VAT Act, guides for TPIN, VAT, and PAYE registration, customs guides. | 5/5 |
| **NAPSA** | NAPSA Act, employer registration guides, contribution schedules. | 5/5 |
| **WCFCB** | Workers' Compensation Act, employer registration forms, accident reporting guides. | 5/5 |
| **Local Councils** | Public notices, by-laws, and fee schedules for Trading Licenses (e.g., Lusaka, Kitwe, Ndola). | 3/5 (Scattered) |
| **Industry Specific** | Data Protection Act (for tech), ZEMA Act (for environment), Health Act (for food). | 4/5 |

#### 

#### **B. Ingestion Pipeline**

1. **Extract:** Use robust tools (like unstructured.io or PyMuPDF) to extract text from PDFs, HTML, and Word documents. This must handle tables (for fee schedules) and multi-column legal text.  
2. **Clean:** Remove headers, footers, page numbers, and artifacts from conversion.  
3. **Chunk:** Do *not* use simple fixed-size chunking.  
   * **Strategy: Semantic & Hierarchical Chunking.**  
   * Use rules to split text along legal boundaries (e.g., "Section," "Part," "Sub-section").  
   * This ensures a single legal concept (like the definition of "employee") is not split across two different chunks, which would destroy its meaning.

#### **C. Metadata Schema (The Core of the System)**

This schema is designed for the *metadata filtering* strategy described in the architecture. Every chunk in the vector database **must** be tagged with this schema:

JSON

```
{
  "chunk_id": "pacra_companies_act_s15_a",
  "source_file": "Companies_Act_2017.pdf",
  "source_url": "https://pacra.org.zm/...",
  "document_type": "Act", // Act, Regulation, Guide, Fee Schedule
  "regulatory_body": "PACRA", // PACRA, ZRA, NAPSA, LCC, ZEMA
  "topic_primary": "Business Registration", // Tax, Employment, Health
  "topic_secondary": "Incorporation", // PAYE, Annual Returns, Trading License
  "act_name": "Companies Act, 2017",
  "section_number": "Section 15(a)",
  "last_updated": "2017-04-12",
  
  // --- Key Filtering Dimensions ---
  "business_type_relevance": ["All"], // or ["Food Service", "Retail"]
  "location_relevance": ["All_Zambia"], // or ["Lusaka", "Kitwe"]
  "employee_count_relevance": ["All"], // or ["1+", "50+"]
  "activity_relevance": ["All"] // or ["data_processing", "food_handling"]
}
```

---

### 

### **IV. Key RAG Prompts**

#### **A. System Prompt (The "Constitution")**

"You are **Chuma Comply**, an expert AI assistant specializing in Zambian business compliance. Your single most important duty is to provide accurate, factual, and helpful information.

**CRITICAL RULES:**

1. **NEVER** answer a question using any knowledge outside of the "CONTEXT" provided.  
2. **YOU MUST** structure your answer as a step-by-step checklist.  
3. **YOU MUST** provide a direct citation for *every* checklist item, using the source\_file and section\_number from the context (e.g., (Source: Companies Act, 2017, Section 15(a))).  
4. If the provided "CONTEXT" does not contain the answer, you **MUST** state: 'I do not have the specific information for that request. Please consult the official \[Regulatory\_Body\] website or a legal professional.'"

#### **B. User Prompt (The "Query")**

**User Query:** "I'm starting a bakery in Kitwe with 2 staff."

Retrieved Context:

\[Chunk from Companies Act about registering a business name...\]

\[Chunk from ZRA guide about TPIN registration...\]

\[Chunk from Employment Code Act about employee contracts...\]

\[Chunk from Kitwe City Council by-laws about food handling permits...\]

---

### 

### **V. Evaluation & Testing Strategy**

A legal app must be tested for accuracy above all else.

* **1\. Golden Set Creation:** Manually create a "golden set" of 25-50 diverse business scenarios (e.g., "solo-consultant in Lusaka," "small-scale mine in Solwezi," "e-commerce shop"). For each scenario, manually write the "perfect" checklist and identify the exact legal sections that should be cited.  
* **2\. RAGAS Evaluation:** Use an evaluation framework like RAGAS to programmatically test the RAG pipeline against the golden set. The most important metrics will be:  
  * **Faithfulness (Groundedness):** **(Priority \#1)** Does the checklist item come *only* from the retrieved text? This measures hallucinations.  
  * **Context Recall:** **(Priority \#2)** Did the retriever *find all* the correct legal sections (PACRA, ZRA, NAPSA, etc.) that we identified in our golden set?  
  * **Context Precision:** Did the retriever also pull in irrelevant junk (e.g., mining laws for a bakery)?  
* **3\. Iteration Loop:**  
  * **Low Faithfulness?** \-\> Make the System Prompt stricter.  
  * **Low Context Recall?** \-\> The retrieval is failing. Improve the Metadata Schema or the Embedding Model.  
  * **Low Context Precision?** \-\> The retrieval is noisy. Implement or tune the Re-ranker.

**Task Breakdown**

| Phase | RAG & Backend Engineer Tasks | Frontend & UX/UI Engineer Tasks  | Key Goals |
| :---- | :---- | :---- | :---- |
| **Phase 1: Foundation & "Blueprint"** | 1\. **Setup Google Cloud:** Create a project, enable Firebase (Hosting, Functions) & Vertex AI APIs.  2\. **Get the Data:** Download all key laws (PACRA, ZRA, NAPSA, *and* the Data Protection Act).  3\. **Define "Smart" Schema:** Design the *metadata* (tags) you will store with each chunk. **This is the core of the advanced plan.**     *Example:* { "source": "Data Protection Act", "topic": "Data Privacy", "activity\_relevance": "data\_processing" } | 1\. **Setup Frontend:** Run pnpm create vite chuma-comply \--template react-ts.  2\. **Setup Firebase:** Run pnpm add firebase and firebase init hosting. 3\. **Design the UI:** Wireframe the app (text box, results area, loading spinner).  4\. **Build Static UI:** Build the React components (ChatInput.tsx, Checklist.tsx) with *no data*. | • Get all tools, accounts, and services set up.  • Have a folder of all the legal text files.  • Have a *finalized schema* for the "smart tags" (metadata). • Have a static, non-functional React app ready to go. |
| **Phase 2: Build the "Smart Library" & Mock UI** | 1\. **Prep for Vertex AI:** Write the "Smart Ingestion" script. This is a big task:   a) **Chunk:** Split your text files (e.g., by section).   b) **Tag (Metadata):** For each chunk, add the correct metadata tags from your schema (e.g., {"topic": "Tax"}). *You can start by doing this manually for the 20-30 most important chunks.*   c) **Embed:** Turn *only* the text part of the chunk into an embedding.   d) **Format:** Save everything as a JSONL file (e.g., {"id": "chunk1", "embedding": \[...\], "metadata": {"topic": "Tax"}}).  2\. **Upload to GCS:** Upload this JSONL file to a Google Cloud Storage (GCS) bucket.  3\. **Create AI Index:** In Vertex AI, create a Vector Search Index from your JSONL file. 4\. **Create API Mock:** Give a *sample* of the "API Contract" JSON (from above) as a simple text file. | 1\. **Use the Mock File:** Create a mock-data.json file inside the public folder.  2\. **Build the Mock UI:** Write fetch('/mock-data.json') to load the fake data.  3\. **Implement Zod:** Run pnpm add zod. Use your Zod schema to parse the mock data to make sure it's correct. 4\. **Build Full UI:** Make the app *fully functional* using this fake data. Add loading spinners, error messages, and display the checklist. | • The RAG "Brain" (Vertex AI Index) is built and *now contains the "smart tags" (metadata)*.  • The Frontend is 100% complete and functional, just using mock data. • **Both devs are still unblocked and can work in parallel.** |
| **Phase 3: Connect with "Smart Logic"** | **Task 1: Build Ingestion Pipeline (Python)** 1\. Create a 2nd-Gen Firebase Cloud Function in **Python**. 2\. Add `unstructured.io` to parse uploaded PDFs. 3\. Implement content-aware chunking (based on `Header` elements). 4\. For each chunk, call Vertex AI `text-embedding-005` model. 5\. Store the `content`, `metadata`, and `embedding` in the `vectorChunks` Firestore collection. **Success Criteria:** a. A PDF can be successfully processed. b. The `vectorChunks` collection is correctly populated with content, metadata, and vectors.  | **Task 2: Build RAG API (TypeScript)** 1\. Create a **tRPC router** (`rag.ts`) in the TypeScript API package. 2\. Implement the "filter-first" RAG logic: a) **Pre-processing:** Call Gemini to get metadata filters from the query. b) **Filtering:** Query Firestore `vectorChunks` using those filters. c) **Vector Search:** Perform in-memory cosine similarity on the filtered results. d) **Generation:** Send Top-K chunks to Gemini for the final answer **Success Criteria**:a. The `rag.getComplianceChecklist` API route works perfectly in isolation. b. The "filter-first" logic correctly finds relevant chunks in Firestore. | **Task 3: Integration & Zod Validation** 1\. **(API):** Add a Zod schema for the final API output. 2\. **(Frontend):** Connect the `ChatView` component to the new `rag.getComplianceChecklist` tRPC hook. 3\. **(Frontend):** Use the shared Zod schema to parse the response. 4\. **Debug Together:** Test Grace's "digital agency" story to confirm the "Data Protection" step appears. **Success Criteria**a.  The app works end-to-end.   b. The app is now "smart" and consistent with the pitch.  c. The Zod schemas protect the app from bad data.  |
| **Phase 4: Test & Deploy** | 1\. **Manual Testing:** Ask the app 20 different business questions. **Crucially, test the "Grace" story** (digital agency \+ data) and a "bakery" (food service) to see if they get different, correct results.  2\. **Prompt Tuning:** If answers are bad, edit the prompt in the Cloud Function (e.g., "You MUST include a citation") and redeploy. This is the fastest way to improve quality.  3\. **Deploy Function:** Make sure the final Firebase Cloud Function is deployed. | 1\. **Final Polish:** Test the app on a real mobile phone (not just desktop) to find any UI bugs.  2\. **Build for Production:** Run pnpm build to create the final optimized app.  3\. **Deploy App:** Run firebase deploy \--only hosting to publish the React/Vite app to the web. | • A working V1 of the "Advanced Vision" is live.  • The app is *proven* to handle specific user scenarios (like Grace's) correctly.   • Both devs have successfully built a full-stack, *advanced* RAG application. |

