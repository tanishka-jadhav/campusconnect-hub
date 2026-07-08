# CampusConnect Hub

> Your all-in-one campus ecosystem — housing, marketplace, team matchmaking, career opportunities, and AI-powered productivity tools. Built for verified students only.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-LLaMA_3-FF6B00)

---

## Core Features

### 🔐 Auth & Security
- Strict `.edu` domain email validation via client-side regex
- Institutional accountability banner displayed at registration
- Supabase Auth with session persistence and auto-refresh
- Row Level Security (RLS) on all database tables

### 🏠 Housing Hub
- Create and browse campus housing listings
- Interactive budget filters (min/max rent range)
- Bedroom count filtering
- Amenity tagging (WiFi, Parking, Furnished, etc.)
- Direct phone and WhatsApp contact actions

### 🛒 Marketplace
- P2P trading board for campus community
- Category browsing (Electronics, Books, Furniture, Transport)
- Condition-based filtering
- One-tap WhatsApp contact with pre-filled inquiry messages
- Sold/active status tracking

### 👥 Team-Up
- Project/hackathon team matchmaking feed
- Dynamic multi-skill tag filtering (Frontend, Backend, ML/AI, Design, etc.)
- Team size and deadline tracking
- Direct email outreach with pre-filled subjects

### 💼 Career Board
- Internal job, internship, and referral posting board
- Type-based filtering (Full-Time, Part-Time, Internship, Co-op, Referral, Research)
- **AI "Polish Referral" button** — converts rough referral requests into polished, corporate-grade messages using Groq LLaMA 3
- Copy-to-clipboard for polished output

### 📁 Resources
- Categorized document repository (Lecture Notes, Assignments, Projects, Slides)
- Course code tagging and search
- File upload to Supabase Storage
- **AI "Summarize Notes" button** — generates bulleted key takeaways in a slide-out drawer using Groq LLaMA 3

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 6, Tailwind CSS 4 |
| **UI Components** | shadcn/ui (Radix UI primitives + CVA) |
| **Icons** | Lucide React |
| **Backend/DB** | Supabase (PostgreSQL, Auth, Storage) |
| **AI Engine** | Groq API (LLaMA 3 8B - `llama3-8b-8192`) |
| **Design** | Glassmorphism, gradient accents, micro-animations |

---

## Project Directory Tree

```
CampusConnect/
├── index.html                          # HTML entry point with Inter font
├── vite.config.js                      # Vite + React SWC + Tailwind CSS v4
├── package.json                        # Dependencies and scripts
├── .env.example                        # Environment variable template
├── .gitignore                          # Git exclusions
│
├── src/
│   ├── main.jsx                        # React DOM entry point
│   ├── App.jsx                         # Root component with auth routing
│   ├── index.css                       # Tailwind v4 theme + glassmorphism + animations
│   │
│   ├── lib/
│   │   ├── supabase.js                 # Supabase client initialization
│   │   └── utils.js                    # cn() class merge utility
│   │
│   ├── services/
│   │   └── groq.js                     # Groq AI service (polish referral + summarize notes)
│   │
│   ├── contexts/
│   │   └── AuthContext.jsx             # Auth provider with .edu validation
│   │
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthPage.jsx            # Login/Register with accountability banner
│   │   │
│   │   ├── layout/
│   │   │   └── AppLayout.jsx           # Responsive sidebar shell
│   │   │
│   │   ├── modules/
│   │   │   ├── HousingHub.jsx          # Housing listings + budget filters
│   │   │   ├── Marketplace.jsx         # P2P trading + WhatsApp actions
│   │   │   ├── TeamUp.jsx              # Team matchmaking + skill filters
│   │   │   ├── CareerBoard.jsx         # Job board + AI referral polisher
│   │   │   └── Resources.jsx           # Document repo + AI summarizer
│   │   │
│   │   └── ui/
│   │       ├── Badge.jsx               # Status badge with variants
│   │       ├── Button.jsx              # Button with gradient/success variants
│   │       ├── Card.jsx                # Glassmorphism card family
│   │       ├── Drawer.jsx              # Animated slide-out panel
│   │       ├── Input.jsx               # Styled text input
│   │       └── Textarea.jsx            # Styled textarea
│
├── supabase/
│   └── migration.sql                   # Complete database schema + RLS + indexes
│
├── README.md                           # This file
└── DEPLOYMENT.md                       # Deployment guide
```

---

## Quick Start (Local Development)

```bash
# 1. Clone the repository
git clone https://github.com/your-username/campusconnect-hub.git
cd campusconnect-hub

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your Supabase and Groq API credentials

# 4. Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Environment Variables

| Variable | Description | Source |
|----------|-------------|--------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key | Supabase Dashboard → Settings → API |
| `VITE_GROQ_API_KEY` | Groq API key for AI features | [console.groq.com](https://console.groq.com) |

---

## Database Setup

Copy the contents of `supabase/migration.sql` into your Supabase SQL Editor and execute. This creates:
- 6 tables with UUID primary keys
- Row Level Security policies for all tables
- Performance indexes on frequently queried columns
- Auto-updating `updated_at` trigger function

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full step-by-step guide.

---

## AI Features

Both AI features use the Groq API with the `llama3-8b-8192` model:

1. **Polish Referral** (Career Board): Transforms informal referral requests into professional, high-impact messages suitable for corporate networking.

2. **Summarize Notes** (Resources): Generates structured, bulleted key takeaways from raw study notes or document content.

The AI service is implemented in `src/services/groq.js` as a clean fetch client with configurable temperature and token limits.

---

## License

MIT
