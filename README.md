# CloudSpend Intelligence

> Production-Quality FinOps Decision-Intelligence Platform powered by FOCUS Billing Data, Statistical Analytics, Machine Learning, and Multi-Agent Evidence Reasoning.

---

## 1. Executive Summary

**CloudSpend Intelligence** is a portfolio-grade FinOps decision-support platform designed to answer critical cloud spend questions:
1. Where is technology spend going?
2. Why did spend change month-over-month?
3. Which accounts, services, or resources drove the change?
4. Which cost spikes are statistically anomalous?
5. What optimization actions are plausible, what could they save, and how confident is the system?

Core operational loop:
```text
OBSERVE → EXPLAIN → DETECT → DIAGNOSE → OPTIMIZE → ESTIMATE → VALIDATE → DECIDE
```

---

## 2. Key Architecture Principles

- **Deterministic Truth**: All financial calculations, period-over-period attribution, statistical z-scores, and time-series forecasts originate from DuckDB SQL and deterministic Python code. **The LLM never owns numerical truth.**
- **Google Gemini Integration**: Gemini is used exclusively for natural-language explanations and contextual reasoning over structured JSON evidence. (Configured via `GEMINI_MODEL=gemini-3.6-flash`).
- **LLM Failure Resilience**: The platform operates seamlessly without an LLM (`MockLLMProvider` mode).
- **No Synthetic Data for Analytics**: Built specifically for real, publicly available **FOCUS (FinOps Open Cost and Usage Specification)** billing data.
- **Human-in-the-Loop Safety**: Decision-support platform only; does not perform destructive resource modifications.
- **Centralized Persistent Analytics Storage**: All Parquet billing datasets, DuckDB state, and uploads resolve under a configurable root directory (`DATA_DIR`).

---

## 3. Prototype Storage Limitation

> [!NOTE]
> **Prototype Architecture Notice**
> - This project is currently a **prototype/demo**.
> - Render Free uses an **ephemeral filesystem**. Therefore, locally stored Parquet analytics files may be lost whenever the Render service restarts or redeploys.
> - For this prototype, external persistent object storage (such as Cloudflare R2 or AWS S3) was **intentionally NOT added** to keep the prototype simple, avoid extra external infrastructure, and eliminate cloud storage costs.
> - If this system is promoted to a production application, persistent object storage or a Render Persistent Disk should be attached to `DATA_DIR`.
> - If a dataset displays `DATASET_STORAGE_MISSING` after a Render service redeploy: click **Delete** next to that dataset in **Settings & Datasets** and re-ingest the FOCUS CSV file.

---

## 4. Persistent Analytics Storage Architecture (`DATA_DIR`)

CloudSpend separates metadata persistence (PostgreSQL) from analytical storage (Parquet files + DuckDB). All analytical runtime files resolve underneath a single centralized storage layer governed by the `DATA_DIR` environment variable.

### Directory Structure
```text
DATA_DIR/
├── parquet/
│   └── <dataset-id>/
│       └── data.parquet       # Canonical Parquet file for DuckDB queries
├── uploads/
│   └── <dataset-id>.csv       # Uploaded raw FOCUS billing files
└── cloudspend.duckdb          # DuckDB analytical database file
```

### Storage Resolution & Relative Keys
- **Local Development**: `DATA_DIR=./data` (resolves to project `./data/`).
- **PostgreSQL Database Storage**: Database records store environment-independent relative keys (`parquet/<dataset-id>/data.parquet`) rather than hardcoded absolute paths, enabling seamless local-to-cloud compatibility.

---

## 5. Dataset Lifecycle & Permanent Deletion Workflow

CloudSpend provides a complete, safe dataset lifecycle including full deletion.

### Permanent Deletion Execution (`DELETE /datasets/{dataset_id}`)
When a user clicks **Delete** on a dataset in **Settings & Datasets**:
1. **User Confirmation**: A confirmation modal prompts `"Delete dataset '[name]'?"` detailing permanent data removal.
2. **PostgreSQL Metadata Cleanup**: Cascading deletion removes associated records from `datasets`, `ingestion_runs`, `data_quality_reports`, `anomalies`, `forecasts`, `opportunities`, `recommendations`, `savings_estimates`, `scenario_runs`, `pipeline_runs`, `agent_runs`, and `investigations`.
3. **Filesystem Cleanup**: The dataset directory (`DATA_DIR/parquet/<dataset-id>/`) and uploaded raw files (`DATA_DIR/uploads/`) are permanently deleted using safe `pathlib` operations.
4. **DuckDB Cleanup**: Associated DuckDB analytical tables are dropped (`DROP TABLE IF EXISTS dataset_<id>`).
5. **UI State Update**: Frontend refreshes dataset lists, clears stale `localStorage` keys, and automatically selects an alternative active dataset.

---

## 6. Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, Recharts, Lucide Icons |
| **Backend API** | Python 3.11, FastAPI, Pydantic v2, structlog |
| **Database** | PostgreSQL (Async SQLAlchemy 2.0 / asyncpg) |
| **Analytical Engine** | DuckDB (In-process SQL), PyArrow, Pandas |
| **ML / Analytics** | NumPy, SciPy, scikit-learn, LightGBM, Statsmodels |
| **LLM Provider** | Google Gemini API (`gemini-3.6-flash`) with `MockLLMProvider` fallback |
| **Hosting** | Vercel (Frontend) + Render Free (Backend) |

---

## 7. Development & Testing Commands

### Local Development Setup
```bash
# Start backend & frontend without Docker
./start-local.sh

# Or start manually:
cd backend
source .venv/bin/activate
export DATA_DIR=./data
uvicorn app.main:app --reload --port 8000
```

### Running Backend Unit & Integration Tests
```bash
cd backend
.venv/bin/pytest tests/ -v
```

### Building Frontend
```bash
cd frontend
npm run build
```
