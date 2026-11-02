# EQUATIONZERO
> **"Discover the Mathematics Hidden in Reality."**  
> *From Raw Data to Mathematical Discovery.*

An advanced, research-oriented scientific AI platform engineered for autonomous mathematical equation discovery, hypothesis testing, dimensional consistency verification, and reproducible academic paper synthesis.

---

## 🌐 Live Production Deployment

- **Official Web Application**: [https://equationzero.vercel.app](https://equationzero.vercel.app)
- **GitHub Repository**: [https://github.com/ghouseahmed226-debug/EquationZero](https://github.com/ghouseahmed226-debug/EquationZero)
- **Vercel Project Dashboard**: [https://vercel.com/ghouseahmed226-debugs-projects/equationzero](https://vercel.com/ghouseahmed226-debugs-projects/equationzero)

---

## 🏛️ Core System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        EQUATIONZERO PLATFORM                           │
├────────────────────┬────────────────────┬──────────────────────────────┤
│     FRONTEND       │    BACKEND API     │      SCIENTIFIC ENGINE       │
│   Next.js 14       │    FastAPI         │      Python 3.12             │
│   TypeScript       │    SQLAlchemy      │      PySR (Symbolic GP)      │
│   Tailwind CSS     │    Pydantic v2     │      SymPy CAS Engine        │
│   KaTeX Math       │    JWT Auth        │      SciPy & NumPy           │
│   Lucide Icons     │    REST v1 APIs    │      Scikit-Learn Baselines  │
└────────────────────┴────────────────────┴──────────────────────────────┘
```

---

## ✨ Features & Interactive Pages

1. **Symbolic Regression Studio** (`/discover`): Pareto-optimal mathematical formulation via Genetic Programming with complexity penalties and live progress feedback.
2. **24-Step Verification Laboratory** (`/verify`):
   - Out-of-sample generalization metrics ($R^2$, RMSE, MAE, MAPE).
   - Residual Gaussian normality testing ($p$-values, skewness, kurtosis).
   - Bootstrap resampling (100+ draws) with 95% confidence intervals.
   - Singularity and undefined division-by-zero boundary tests.
3. **Equation Arena** (`/arena`): Multi-paradigm tournament pitting analytical equations against Polynomial Series, Ridge Regression, SINDy dynamical models, and Deep MLPs.
4. **Scientific Dataset Explorer** (`/datasets`): Tabular preview and cryptographic SHA-256 fingerprinting for both user-uploaded and synthetic datasets.
5. **Pre-configured Benchmarks** (`/benchmarks`): Gold-standard datasets with exact ground-truth equations (Kepler's Third Law, Ideal Gas Law, Simple Pendulum, Damped Harmonic Oscillator).
6. **Zero Autonomous Researcher** (`/agent`): Multi-agent telemetry system coordinating data audits, hypothesis formulation, and Popperian falsification tests.
7. **Reproducibility Vault** (`/vault`): Content-addressed SHA-256 fingerprinting of datasets, RNG seed tracking, library manifests, and 1-click execution replay scripts.
8. **Research Paper Studio** (`/paper`): Instant generation of peer-review-ready academic manuscripts in LaTeX (`.tex`) and Markdown format with dynamic experimental metrics injection.

---

## 🚀 Local Execution Setup

### 1. Prerequisites
- **Python 3.12+**
- **Node.js 20+**

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be live at: `http://localhost:8000/api/docs`

### 3. Frontend Setup
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🔬 Scientific Integrity Safeguards
- **Synthetic Distinction**: All benchmark datasets are cryptographically tagged with `[SYNTHETIC]` metadata.
- **No Hallucinated Claims**: Discovered equations are categorized as mathematical curve fits with explicit domain limitations until independently verified.
- **Zero Silent Data Alteration**: Missing value omissions and unit conversions are fully reported in the audit log.
