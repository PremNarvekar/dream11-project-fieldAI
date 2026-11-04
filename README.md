# FieldVision AI — Cricket Field Visualization & Tactical Analytics

> **"Just show me the live field placement."**  
> *— Inspired by a cricket fan's Reddit comment seeking clarity on field settings during live broadcasts.*

FieldVision AI is an AI-powered cricket spatial visualization and tactical analytics platform. Designed with the editorial elegance of **Clarify** and the minimalist clarity of **Ventrix**, it transforms complex fielding telemetry into intuitive, interactive visual intelligence for casual fans, serious enthusiasts, coaches, and tactical analysts.

---

## 🌟 Key Highlights & Architecture

- **Visual Ground Engine**: Scaled SVG field model (70m boundary rope, official 30-yard restriction circle, 22-yard pitch with popping & bowling creases, and live distance calculations in meters from the striker's stance).
- **Strict Cricket Team Logic & Synchronization**:
  - **Batting Team**: Striker and Non-Striker (Orange identity).
  - **Bowling Team**: Current Bowler, Wicketkeeper, and 9 Outfielders (Teal identity).
  - **Multi-Match Support**: Switch between **IND vs AUS** (Narendra Modi Stadium) and **ENG vs SA** (Kensington Oval) with live squad synchronizations.
  - **Explicit Demonstration Notice**: Persistent `DEMO MATCH` badge guarantees honest representation of simulated match data.
- **Interactive Drag-and-Drop**: Freeform fielder movement with strict boundary clamping ($x^2 + y^2 \le R^2$) and pointer capture.
- **Tactical Field Presets**: 1-click formation deployment for **Powerplay (Overs 1–6)**, **Attacking**, **Defensive**, and **Death Overs (Overs 17–20)**.
- **Batter Handedness Switcher (RHB / LHB)**: Dynamic lateral mirroring with automatic Off-Side / Leg-Side sector updates and position renaming.
- **ICC Law 28 Compliance Engine**: Real-time validation of:
  - Outer circle restrictions (max 2 in Powerplay, max 5 in non-Powerplay).
  - Law 28.1 (maximum 5 fielders on the leg side).
  - Law 28.4 (maximum 2 fielders behind square on the leg side).
- **Gemini 2.5 Flash AI Engine**: Full-fidelity spatial telemetry payload serialization sent to a secure FastAPI backend, generating contextual gap diagnoses, specific fielder adjustments, and tactical summaries with zero API key exposure.
- **Before-and-After Comparison**: Interactive visual and metric diff modal showing original vs. recommended coordinates, displacement in meters, tactical justifications, and instant Apply/Reject actions.
- **AI Cricket Explainer**: Built-in modal explaining core cricket concepts (Yorker, Powerplay, Slip Cordon, Wide Yorker, 30-Yard Circle) for beginners.
- **Idea Journey Reference & Embedded PDF Viewer**:
  - Clickable document preview card in the dedicated *"Idea Journey – How We Got Here"* section.
  - Interactive embedded PDF viewer with zoom controls (60% to 160%), scroll, download, and print capabilities.
  - Direct **"View Original PDF"** button opening `/fieldvision-idea-journey.pdf` in a clean, standalone browser tab.

---

## 📐 Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite 8, Tailwind CSS v4, Lucide React |
| **Backend** | Python 3.12, FastAPI, Uvicorn, Pydantic v2 |
| **AI / LLM** | Google Gemini 2.5 Flash (`google-genai` SDK) with Structured JSON Schema |
| **Physics & Math** | Scaled Euclidean geometry ($0.1842\text{ m/unit}$), polar angle sector resolution, boundary clamping |
| **Deployment** | Netlify (Frontend SPA), Render (FastAPI Web Service) |

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18 or higher)
- Python 3.10+
- (Optional) Google Gemini API Key

### 1. Clone the Repository
```bash
git clone https://github.com/PremNarvekar/dream11-project-fieldAI.git
cd dream11-project-fieldAI
```

### 2. Configure Backend
```bash
cd backend
python -m venv venv

# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Open .env and insert your GEMINI_API_KEY (optional; fallback rules active if omitted)
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Backend health check is accessible at: `http://127.0.0.1:8000/api/health`

### 3. Configure Frontend
In a new terminal:
```bash
cd fieldvision-ai
npm install
npm run dev
```

Visit: `http://localhost:5173`

---

## 🧪 Comprehensive Automated Audit & Test Suite

The project features a full suite of automated end-to-end and domain compliance tests.

### Run All 12 End-to-End Tests:
```bash
node test_e2e_full.mjs
```
*Executes all 68 assertions across match state, batter mirroring, dragging geometry, presets, live Gemini API integration, Before/After comparison math, Law 28 detection, export JSON structure, graceful fallback, and PDF asset integrity.*

### Run Backend Pytest Audit:
```bash
cd backend
.\venv\Scripts\python.exe test_audit.py
```
*Validates coordinate calibration, Law 28.1 & 28.4 violations, boundary clamping, and live Gemini JSON parsing.*

### Run Linter & Production Build:
```bash
cd fieldvision-ai
npm run lint    # 0 errors, 0 warnings
npm run build   # Clean bundle generated in ~1.8s
```

---

## 🌐 Production Deployment

### Frontend (Netlify)
The repository includes `netlify.toml` and `fieldvision-ai/public/_redirects`:
- **Build Command**: `cd fieldvision-ai && npm install && npm run build`
- **Publish Directory**: `fieldvision-ai/dist`
- **Environment Variables**:
  - `VITE_BACKEND_URL`: URL of your deployed Render backend (e.g. `https://fieldvision-ai-backend.onrender.com`)

### Backend (Render)
The repository includes `render.yaml` (Render Blueprint):
- **Runtime**: Python 3.12
- **Build Command**: `pip install -r backend/requirements.txt`
- **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables**:
  - `GEMINI_API_KEY`: Secret Google Gemini API Key
  - `ALLOWED_ORIGINS`: Your Netlify frontend domain

---

## 📄 Idea Journey Document

The original concept document detailing the transition from the Reddit fan request to a full-stack tactical platform is embedded in the application and accessible in the public directory:
- [View Idea Journey PDF](file:///fieldvision-ai/public/fieldvision-idea-journey.pdf) (when running locally: `http://localhost:5173/fieldvision-idea-journey.pdf`)

---

## ⚖️ License
Released under the MIT License. Developed for the sports intelligence and cricket analytics community.
