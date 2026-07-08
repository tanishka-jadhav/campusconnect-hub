# CampusConnect Hub — Project Reference & Interview Preparation Guide

Welcome to the definitive documentation and study reference for **CampusConnect Hub**. This guide is designed to help you thoroughly understand every layer of the system, explain its architectural decisions, showcase how it outperforms existing platforms, and prepare you for any full-stack and AI technical interview questions.

---

## Table of Contents
1. **System Overview & Architecture**
2. **Competitive Analysis (Existing Systems vs. Our Solution)**
3. **Data Model & Database Schema Breakdown**
4. **AI Integration Details (Groq & LLaMA 3.1)**
5. **Full-Stack & AI Interview Q&A Guide**
6. **Future Scope & Extensibility Roadmap**

---

## 1. System Overview & Architecture

CampusConnect Hub is built using a modern decoupled serverless architecture. The client handles all rendering, routing, and UI logic, while the backend leverages managed Postgres, authentication, and serverless storage via Supabase, with cognitive services powered by Groq's high-speed inference engine.

```mermaid
graph TD
    subgraph Client Layer [Frontend (Vite + React 19)]
        A[React App Shell] --> B[State Router]
        B --> C[Auth Context]
        B --> D[Module Views]
        E[Tailwind CSS v4 + Radix Primitives] -.-> D
    end

    subgraph Service Layer [API & Backend Services]
        C -->|Session Management| F[Supabase Auth]
        D -->|Postgres REST API| G[Supabase Database]
        D -->|S3 Multipart Upload| H[Supabase Storage]
        D -->|Fetch API / HTTPS| I[Groq AI Gateway]
    end

    subgraph Database Layer [PostgreSQL]
        G -->|Read / Write| J[(Relational Tables)]
        J -->|Row Level Security| K[Security Policies]
        J -->|Triggers| L[Updated At Function]
    end
```

### Key Architectural Flow
1. **Authentication**: Users sign up with a strict client-side verification check ensuring their email matches `.edu` (or international equivalent). Supabase Auth registers the user and creates a secure JWT. This JWT is sent automatically in the headers of all database queries to identify the user at the database level.
2. **Database Queries**: When query requests are sent, Supabase parses the JWT and applies Row Level Security (RLS) policies. Authenticated users can view listings, but they are prevented from updating or deleting rows that belong to others.
3. **AI Tasks**: The frontend coordinates directly with Groq via secure fetch queries using the LLaMA-3.1-8B model. Results are loaded into local state and immediately rendered inside animated side drawers.

---

## 2. Competitive Analysis (Existing Systems vs. Our Solution)

How does CampusConnect Hub compare to traditional platforms like Facebook Groups, Slack, Discord, and WhatsApp?

| Comparison Criteria | Legacy Platforms (Facebook, WhatsApp, Slack) | CampusConnect Hub |
| :--- | :--- | :--- |
| **Trust & Verification** | Open to anyone, high spam rates, fake profiles, and scams. | Strict email verification restricts access strictly to institutional domain holders. |
| **Institutional Accountability** | Anonymous or unverified names; actions have no real-world consequences. | Prominent institutional accountability banner linking digital actions directly to educational identity. |
| **Fragmentation** | Highly fragmented. Housing is on Facebook, trading on WhatsApp, study groups on Discord. | Unified portal linking Housing, P2P Marketplace, Team-Up, Career referrals, and Study Resources. |
| **AI Integration** | None, or generalized bots that do not understand context. | Integrated LLaMA-3.1 templates optimized specifically for student referral generation and note summarization. |
| **Direct Contact Action** | Users must manually exchange numbers and copy-paste text. | Dynamic triggers, such as one-click WhatsApp pre-filled contact messages and email templating. |

### Our Unique Value Proposition (UVP)
Our system creates a **trusted walled garden**. By utilizing educational domains, the risk of marketplace scams and housing fraud is drastically reduced. Integrating direct actions like pre-filled WhatsApp templates accelerates deal closures and team matching, removing common micro-friction points.

---

## 3. Data Model & Database Schema Breakdown

The PostgreSQL database is organized into six highly optimized relational tables:

```mermaid
erDiagram
    profiles ||--o{ listings_housing : "creates"
    profiles ||--o{ listings_marketplace : "lists"
    profiles ||--o{ project_teams : "posts"
    profiles ||--o{ career_board : "shares"
    profiles ||--o{ resources : "uploads"

    profiles {
        uuid id PK
        string email UNIQUE
        string full_name
        string college
        string email_domain
        timestamp created_at
    }
    listings_housing {
        uuid id PK
        uuid user_id FK
        string title
        numeric rent
        string address
        text[] amenities
    }
    listings_marketplace {
        uuid id PK
        uuid user_id FK
        string title
        numeric price
        string condition
        string whatsapp_number
    }
    project_teams {
        uuid id PK
        uuid user_id FK
        string project_name
        text[] looking_for
        string contact_email
    }
    career_board {
        uuid id PK
        uuid user_id FK
        string title
        string company
        string type
        string referral_contact
    }
    resources {
        uuid id PK
        uuid user_id FK
        string title
        string category
        string course_code
        text content
        string file_url
    }
```

### Row Level Security (RLS) Explained
Every table has RLS enabled by default. For example, on the `listings_housing` table:
*   `SELECT` policy: `TO authenticated USING (true)` — allows any logged-in student to browse listings.
*   `INSERT`, `UPDATE`, `DELETE` policy: `USING (auth.uid() = user_id)` — ensures that students can only create listings with their own ID, and cannot edit or delete listings belonging to other users.

---

## 4. AI Integration Details (Groq & LLaMA 3.1)

We consume the Groq Cloud API directly inside the frontend code at `src/services/groq.js` using standard HTTPS fetches. The integration utilizes the `llama-3.1-8b-instant` model, which provides exceptionally fast processing speeds.

### Feature 1: Polish Referral (Career Board)
*   **System Prompt**: Operates as a professional career coach. It accepts a rough, unstructured list of skills and outputs a formal, corporate-grade referral request template.
*   **Engineering Technique**: The system temperature is set to `0.6` to balance creativity with professional structure. Preamble text is explicitly suppressed in the system instructions to return immediately usable clean text.

### Feature 2: Summarize Notes (Resources)
*   **System Prompt**: Acts as an academic summarizer. It extracts key definitions, formulas, and concepts, rendering them as clean bullet points.
*   **Engineering Technique**: The system temperature is set to `0.4` to ensure strict factual accuracy, preventing the model from hallucinating or introducing external data.

---

## 5. Full-Stack & AI Interview Q&A Guide

Here are the most common technical questions an interviewer might ask about this system and how you should answer them:

### Q1: What is Row Level Security (RLS) in Supabase/Postgres, and why did you use it?
**Answer**: 
> "RLS allows us to control access to specific rows in a table based on the identity of the user executing the query. Instead of writing custom backend middleware to filter out unauthorized modifications, the database itself checks the security policies before returning or editing rows. In this project, any logged-in student can read listings (`SELECT`), but the database strictly checks `auth.uid() = user_id` for write operations, ensuring no student can overwrite or delete another student's posts."

### Q2: Why did you choose Vite + React instead of Next.js?
**Answer**: 
> "For a highly interactive, dashboard-driven Single Page Application (SPA), a client-side Vite build is incredibly lightweight, offers near-instantaneous HMR during development, and compiles into static HTML/JS/CSS assets. This allows us to serve the entire app from a global CDN (like Vercel or Netlify) at near-zero hosting cost, relying entirely on serverless Supabase APIs and Groq gateways for database and AI operations."

### Q3: How did you implement .edu email domain validation safely?
**Answer**: 
> "We implement a strict multi-layered verification system. On the client, a regular expression check enforces that emails end in valid educational domains like `.edu`, `.ac.in`, or `college.edu` before allowing form submission. When the user registers, Supabase extracts the domain split and saves it directly to the profiles table. In a full production setup, we also configure Supabase Auth settings to send verification emails, ensuring users cannot gain access without possessing a live inbox on that educational domain."

### Q4: Why is it risky to call the Groq API directly from the frontend? How would you secure it in production?
**Answer**: 
> "Calling the Groq API from the frontend requires exposing the `VITE_GROQ_API_KEY` in the client bundle. This key can be extracted by inspect tools, allowing unauthorized users to hijack the key and incur API costs. To secure this in production, I would set up a proxy API route using a serverless function (such as Vercel Serverless Functions or Supabase Edge Functions). The client would call our proxy route, and the proxy function would append the secret key stored securely in environment variables before forwarding the request to Groq."

### Q5: How does Tailwind CSS v4 differ from Tailwind v3 in compilation and configuration?
**Answer**: 
> "Tailwind CSS v4 introduces a fully native Rust-based engine that speeds up compilation by up to 10x. It eliminates the need for a separate `tailwind.config.js` file, shifting configuration entirely to CSS variables inside `index.css` via the `@theme` directive. In this project, Vite imports Tailwind directly as a CSS compiler plugin, generating a highly optimized, minified stylesheet containing only the utility classes utilized in the application."

### Q6: How does the system handle database relationship constraints?
**Answer**: 
> "We enforce cascading integrity in foreign key constraints. Tables like `listings_housing` and `project_teams` reference the `profiles` table using `REFERENCES profiles(id) ON DELETE CASCADE`. If a student deletes their account, all of their marketplace listings, housing offers, and shared files are automatically purged by the Postgres engine, keeping the database clean and free of orphaned records."

---

## 6. Future Scope & Extensibility Roadmap

If you want to scale this project further, here is how you should outline the roadmap:

### 1. Secure AI Gateway (Edge Functions)
Migrate the Groq service from the frontend to **Supabase Edge Functions** (Deno-based). This secures the API key and allows rate limiting using Redis/Upstash to prevent DDoS attacks and API abuse.

### 2. Real-Time Chat (WebSockets)
Leverage **Supabase Realtime** broadcast channels to implement instant, in-app messaging between buyers and sellers, or project creators and team candidates, reducing reliance on external tools like WhatsApp.

### 3. Automated Team Matchmaking
Build an AI-driven matchmaking algorithm that automatically parses the skills profiles of students and suggests suitable open roles in `project_teams` matching their stack.

### 4. Interactive Campus Map
Integrate Mapbox or Google Maps API into the **Housing Hub** to display housing listings visually relative to the university campus boundaries, helping students calculate walking/transit times.
