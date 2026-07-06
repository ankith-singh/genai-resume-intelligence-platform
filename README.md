# GenAI Resume Intelligence Platform 🚀


![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)
![Node.js](https://img.shields.io/badge/Node.js-22-green)
![Express](https://img.shields.io/badge/Express-4-black)
![Gemini](https://img.shields.io/badge/Google-Gemini-orange)
![License](https://img.shields.io/badge/License-MIT-green)

An enterprise-grade, high-fidelity resume parsing, analysis, and simulation application. Engineered to demonstrate advanced AI Engineering, RAG architectures, LLMOps, systemic design, and modern full-stack development.

Designed to serve as a portfolio hallmark for senior roles in Artificial Intelligence, Machine Learning, and Software Development Engineering.

---

## 🌐 Live Demo

> 🚧 Coming Soon (Deployment in Progress)

The application will be deployed on Vercel after final testing.

Repository:
https://github.com/ankith-singh/genai-resume-intelligence-platform

## 🌟 Key Technical Features

## ✅ Platform Features

- ✅ AI Resume Parsing
- ✅ ATS Weighted Resume Scoring
- ✅ Hybrid RAG Resume Assistant
- ✅ Job Description Matching
- ✅ Career Roadmap Generator
- ✅ Interview Simulator
- ✅ Resume Version Comparison
- ✅ Multi-Agent Workflow Visualization
- ✅ Analytics Dashboard
- ✅ RAGAS Evaluation Dashboard

### 1. Robust Parser Engine (Gemini API)
- Extracts nested metrics from resumes (Skills, Experience chronologies, projects, academic Pedigree, certifications).
- Implements resilient server-side JSON schema definitions with fallback parser overrides.

### 2. Weighted non-LLM-only ATS Scoring
- Recruiter-grade scoring algorithm mapping specific Weights: **Skills (30%)**, **Keywords (20%)**, **Experience (25%)**, **Education (10%)**, and **Projects (15%)**.
- Highlights lexical gaps and gives improvement suggestions.

### 3. BM25 & Semantic Hybrid Retrieval RAG Chatbot
- Employs double indexing: classical TF-IDF keyword overlap combined with semantic synonym search vectors.
- Exposes complete search tracking with chronological weights.

### 4. DoubleEval Validation Telemetry (RAGAS & DeepEval Calibration)
- Measures alignment metrics online: Faithfulness, Recall, Precision, and Answer Relevancy percentages.
- Tracks hallucination metrics over a trend graph.

### 5. Multi-Agent stateGraph Simulation (LangGraph)
- Orchestrates 5 specialized agent nodes (Analysis, ATS, Coach, Interview, and Improver), detailing state transfers.

### 6. Interactive Mock Technical Interview Simulator
- Generates case questions matching resume highlights and target job metrics.
- Accepts and grades user answers, giving strategic correct model responses.

### 7. AI Career Advising & Learning Curriculum Roadmaps
- Charts timeline roadmap modules with learning durations, goals, milestones, and suggested materials.

### 8. Side-by-Side Resume Comparer
- Analyzes iteration document score variances, added/removed keywords, and resolved weaknesses between two uploads.

---

---

## 🏗️ System Architecture

```
          Resume Upload
                 │
                 ▼
         Gemini Resume Parser
                 │
                 ▼
      Structured Resume JSON
                 │
      ┌──────────┴──────────┐
      ▼                     ▼
 ATS Scoring          Hybrid RAG Index
      │                     │
      ▼                     ▼
 Analytics          AI Resume Assistant
      │
      ▼
Career Coach
      │
      ▼
Interview Simulator
```

## 🛠️ Stack Components



- **Backend**: Node.js, Express, TypeScript (transpiled automatically with CJS bundles using `esbuild`).
- **Frontend**: React 19, TypeScript, Tailwind CSS, Recharts.
- **AI Suite**: Gemini API via `@google/genai` (utilizing `gemini-3.5-flash`), custom BM25 TF-IDF lexical models.
- **Persistent Storage**: Real-time database emulators storing profiles and logs in `db.json` files.
- **Containers**: Docker and Docker Compose files.

---

## 🚀 Speed Setup

Get the platform running in less than 3 minutes:

### Local Development
```bash
# 1. Install workspace dependencies
npm install

# 2. Assign environment keys
echo "GEMINI_API_KEY=your_key_here" > .env

# 3. Boot full-stack dev servers
npm run dev
```

### Build & Production Start
```bash
# Compile client assets and bundle server codes
npm run build

# Standalone start
npm start
```
---

## 📂 Code Layout Architectures

```
├── /docker/                  # Production Dockerfile and docker-compose configurations
├── /docs/                    # Advanced SYSTEM_DESIGN blueprints and DEPLOYMENT manuals
├── /tests/                  # Robust automated testing suites (RAG and calculation checks)
├── /src/
│   ├── /components/          # Split frontend modules (Auth, Upload, ATS, RAG, etc.)
│   ├── App.tsx               # Primary React interface coordinator
│   ├── types.ts              # Globally unified TypeScript interfaces
│   ├── database_store.ts     # Persistent local JSON data store engines
│   ├── hybrid_rag.ts         # Dual BM25/Vector semantic alignment structures
│   ├── gemini_service.ts     # Safe Gemini model operations
│   └── main.tsx              # Standard React layout bootstraps
├── server.ts                 # Production Express full-stack framework
└── package.json              # System configuration scripts
```
---

## 🚀 Future Improvements

- PDF Resume Parsing
- DOCX Resume Upload
- Pinecone Vector Database
- PostgreSQL Support
- JWT Authentication
- Resume Template Generator
- Admin Dashboard
- Cloud Storage Integration
- Docker Production Deployment
- CI/CD Pipeline using GitHub Actions
---

## 👨‍💻 Author

**Ankit Singh**

GitHub:
https://github.com/ankith-singh
