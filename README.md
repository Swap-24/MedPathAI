<div align="center">
<pre>
```
    ███╗░░░███╗███████╗██████╗░██████╗░░█████╗░████████╗██╗░░██╗
    ████╗░████║██╔════╝██╔══██╗██╔══██╗██╔══██╗╚══██╔══╝██║░░██║
    ██╔████╔██║█████╗░░██║░░██║██████╔╝███████║░░░██║░░░███████║
    ██║╚██╔╝██║██╔══╝░░██║░░██║██╔═══╝░██╔══██║░░░██║░░░██╔══██║
    ██║░╚═╝░██║███████╗██████╔╝██║░░░░░██║░░██║░░░██║░░░██║░░██║
    ╚═╝░░░░░╚═╝╚══════╝╚═════╝░╚═╝░░░░░╚═╝░░╚═╝░░░╚═╝░░░╚═╝░░╚═╝
```
</pre>

**AI-Powered Care Navigation & Healthcare Financing for India**

*From first symptom to financing approval — guided by AI, every step of the way.*

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)
![LangGraph](https://img.shields.io/badge/LangGraph-0.2.28-4B8BBE?style=flat-square)
![Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash-4285F4?style=flat-square&logo=google)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?style=flat-square&logo=supabase)

</div>

---

## What is MedPath AI?

MedPath AI is a full-stack conversational healthcare navigation platform built for the Indian market. Describe your symptoms in plain language — the AI figures out what procedure you need, finds the right hospitals in your city, shows a personalised cost breakdown adjusted for your medical history, and walks you through applying for a Poonawalla Fincorp medical loan. All in one chat.

No phone calls. No clinic hopping. No guesswork.

---

## Features

- **Conversational clinical intake** — Gemini 2.5 Flash extracts procedure, city, urgency, and ICD-10 codes from plain language
- **Emergency bypass** — detected at ≥85% confidence, skips clarification entirely and surfaces hospitals immediately with a red alert banner
- **Intelligent hospital ranking** — scored by cost match, quality rating, NABH/JCI accreditation, wait time, and GPS distance
- **Personalised cost breakdowns** — comorbidity multipliers (diabetes, cardiac, kidney, etc.) applied on top of procedure base costs
- **PFL loan pre-qualification** — instant GREEN / YELLOW / RED eligibility decision based on CIBIL, income, FOIR, and loan multiple
- **Gemini document extraction** — upload your salary slip or CIBIL report and the AI fills in your financial profile automatically
- **Real-time loan tracking** — patient app polls loan status every 3 seconds; sees the officer's decision the moment it's made
- **5-step registration wizard** — health profile, comorbidities, insurance, financials, and emergency contact
- **Spectator-safe officer dashboard** — completely separate Vite build for PFL officers; ships zero patient code

### Coming Soon
- **AI second opinion** — challenge a hospital recommendation with a follow-up question
- **User profiles** — persistent health history and past consultation summaries
- **Real PFL API** — live Poonawalla Fincorp loan disbursement integration

---

## Tech Stack

```
┌──────────────────────────────────────────────────────────┐
│                React 19 + Vite (Frontend)                │
│        React Router 7 · Tailwind v4 · Zustand 5          │
└─────────────────────┬────────────────────────────────────┘
                      │ HTTP + REST
         ┌────────────┴────────────┐
         │                         │
┌────────▼────────┐      ┌─────────▼──────────┐
│  FastAPI 0.115  │      │  Supabase (Postgres) │
│  LangGraph      │◀────▶│  + Storage Bucket    │
│  Pipeline       │      │  9 tables            │
└────────┬────────┘      └─────────────────────┘
         │
    ┌────┴──────────────────────────┐
    ▼            ▼                  ▼
 INTENT       PROVIDER           COST + RESPONSE
 Gemini       Pure Python        Formula Engine
 2.5 Flash    Hospital           + Gemini
 Clinical     Scoring            2.5 Flash
 Intake       Engine
```

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS v4, React Router 7 |
| State | Zustand 5, custom hooks (useChat, useLoan, useDocuments) |
| Backend | FastAPI 0.115, Uvicorn 0.30, Pydantic v2 |
| AI Pipeline | LangGraph 0.2.28, Gemini 2.5 Flash |
| Clinical Intake | `gemini-2.5-flash` (intent extraction, ICD-10 mapping) |
| Relevance + Scoring | Pure Python, Pandas, Haversine distance |
| Document Extraction | `gemini-2.5-flash` (PDF/image → structured JSON) |
| Database | Supabase Postgres + Supabase Storage |

---

## Getting Started

### Prerequisites
- Node.js 20+
- Python 3.11+
- A Supabase project (free tier works)
- A Google Gemini API key (Gemini 2.5 Flash access required)

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/MedPathAI.git
cd MedPathAI
```

### 2. Backend — Python environment
```bash
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Backend — environment variables
Create a `.env` file inside `backend/`:
```env
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_KEY=<your-supabase-anon-or-service-key>
GEMINI_API_KEY=<your-gemini-api-key>
DOCUMENT_BUCKET=medical-documents
DOCUMENT_EXTRACTION_ENABLED=false
```

### 4. Run the backend
```bash
python ./backend/main.py   # → http://localhost:8000
```

### 5. Frontend
```bash
cd medpathai
npm install
npm run dev         # → http://localhost:5173 (patient app)
npm run dev:pfl     # → http://localhost:5174 (PFL officer dashboard)
```

### 6. Verify everything is running
- `http://localhost:5173` → Patient chat app
- `http://localhost:5174` → PFL officer dashboard
- `http://localhost:8000` → `{"status": "MedPath AI is running 🚀"}`
- `http://localhost:8000/docs` → FastAPI Swagger UI (test `/api/chat` here)

On first run the backend loads hospital, procedure, and city data from Supabase into memory. Seed CSVs are in `backend/data/`.

---

## How It Works

1. Register with your health profile, comorbidities, insurance details, and financials
2. Upload financial documents — salary slip, ITR, CIBIL report (Gemini extracts the data automatically)
3. Open the chat and describe your symptoms or the procedure you need
4. The AI asks up to **3 targeted clarifying questions** — then commits to a recommendation
5. Get a ranked list of hospitals in your city with personalised cost breakdowns
6. Select a hospital and apply for a Poonawalla Fincorp medical loan in one click
7. The AI runs an instant eligibility check and submits your application
8. Track your loan status live — the PFL officer's decision appears in seconds

---

## ML Scoring Pipeline

Every argument — sorry, every *argument* in the chat — runs through four stages in the LangGraph pipeline:

| Node | Model / Engine | Role |
|---|---|---|
| Intent | Gemini 2.5 Flash | Extracts procedure, city, budget, urgency, emergency flag, ICD-10 hint |
| Provider | Pure Python + Pandas | Scores hospitals by cost, quality, accreditation, wait time, GPS distance |
| Cost | Formula Engine | Personalised breakdown with comorbidity multipliers + PFL loan options |
| Response | Gemini 2.5 Flash | Generates warm, clinically-phrased summary or emergency alert |

**Comorbidity multipliers:** Kidney Disease +22% · Cardiac +18% · Diabetes +12% · Obesity +10% · Hypertension +8% · Asthma +6%

**PFL eligibility tiers:** CIBIL ≥700, income ≥₹15k/month, FOIR ≤50%, loan ≤10× income → **GREEN** (instant approval) · soft flags → **YELLOW** · hard failure → **RED** (alternatives suggested)

---

## Project Structure

```
MedPathAI/
├── backend/                        # FastAPI + LangGraph server
│   ├── main.py                     # All HTTP endpoints (15 routes)
│   ├── graph.py                    # LangGraph StateGraph definition
│   ├── loan_engine.py              # PFL credit policy + EMI calculator
│   ├── db.py                       # Supabase client + all DB helpers
│   ├── data_loader.py              # Hospital search + cost formulas
│   ├── nodes/
│   │   ├── intent.py               # Gemini clinical intake node
│   │   ├── provider.py             # Hospital scoring node (pure Python)
│   │   ├── cost.py                 # Cost breakdown + loan options node
│   │   └── response.py             # Gemini response generation node
│   └── data/                       # Seed CSVs (hospitals, procedures, cities)
│
└── medpathai/                      # React 19 + Vite frontend
    ├── src/
    │   ├── screens/
    │   │   ├── Chats/              # Main chat arena + hospital cards
    │   │   ├── Documents/          # Upload + Gemini extraction UI
    │   │   ├── Loans/              # Loan history + status tracking
    │   │   ├── Login/              # Auth screen
    │   │   └── Registrations/      # 5-step onboarding wizard
    │   ├── components/             # AppShell, Sidebar, EmergencyBanner
    │   ├── hooks/                  # useChat, useLoan, useDocuments, useGeolocation
    │   ├── store/                  # Zustand: chatStore, userStore, uiStore
    │   └── api/                    # Axios helpers per domain
    └── officer/                    # PFL dashboard (separate Vite build)
```

---

## Roadmap

- [x] Conversational AI intake via LangGraph + Gemini
- [x] Hospital discovery + multi-factor scoring
- [x] Personalised cost breakdowns with comorbidity multipliers
- [x] PFL medical loan pre-qualification engine
- [x] Gemini-powered document extraction
- [x] Real-time loan status tracking
- [x] PFL officer approval dashboard (separate build)
- [x] Emergency detection + bypass flow
- [x] 5-step registration wizard
- [x] Admin analytics dashboard
- [ ] AI second opinion mode
- [ ] User profile settings screen
- [ ] Real Poonawalla Fincorp API integration

---

<div align="center">
  <sub>Built with 🏥 by KIIT0001</sub>
</div>