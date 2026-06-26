# Lumora AI — RAG Document Assistant

A production-grade AI-powered document assistant built with a full RAG (Retrieval-Augmented Generation) pipeline. Upload PDFs, ask questions, and get accurate answers with source citations — all backed by semantic search and streaming AI responses.

Built as the Round-2 submission for the **IR INFOTECH Full Stack Developer Internship**.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, TailwindCSS, Framer Motion |
| State | Zustand + TanStack Query |
| UI Components | shadcn/ui, Radix UI |
| Backend | FastAPI, Python 3.11 |
| LLM | OpenAI gpt-4o-mini (streaming via SSE) |
| Embeddings | BAAI/bge-small-en-v1.5 (local, no API cost) |
| Vector DB | ChromaDB (per-user, per-document collections) |
| Auth | Firebase Authentication (with local dev fallback) |
| Storage | Firebase Storage (with local temp fallback) |
| Document parsing | PyMuPDF, LangChain text splitter |

---

## Features

- **Document Upload** — drag-and-drop PDF/TXT/DOCX upload with real-time processing status
- **RAG-powered Chat** — semantic retrieval from uploaded documents, streamed responses via SSE
- **Source Citations** — every AI answer cites the exact document chunks it used, with page numbers
- **PDF Viewer** — in-browser PDF rendering with zoom, rotation, and page navigation
- **Dual Theme** — light/dark/system theme with CSS custom property token system
- **Functional Settings** — reduced motion, compact mode, auto-open sources panel, sound effects — all persisted to localStorage
- **Command Palette** — `Ctrl+K` global search
- **Conversation History** — all chat sessions persisted per user

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         React Frontend                          │
│  Zustand stores · TanStack Query · Framer Motion · shadcn/ui   │
└──────────────────────────┬──────────────────────────────────────┘
                           │  REST + SSE  (Vite proxy → :8000)
┌──────────────────────────▼──────────────────────────────────────┐
│                        FastAPI Backend                          │
│                                                                 │
│  Upload ──► PyMuPDF ──► RecursiveTextSplitter                  │
│                              │                                  │
│                    BGE-small-en-v1.5 embeddings                 │
│                              │                                  │
│                         ChromaDB                               │
│                              │                                  │
│  Query ──► embed ──► cosine search ──► top-K chunks            │
│                              │                                  │
│              OpenAI gpt-4o-mini (streaming SSE)                │
└─────────────────────────────────────────────────────────────────┘
```

**RAG pipeline detail:**
1. PDF text extracted page-by-page with PyMuPDF
2. Chunks of 800 tokens, 150-token overlap (context preservation)
3. Asymmetric BGE embeddings — query prefix added at retrieval time for better semantic match
4. ChromaDB similarity search, top-10 results filtered by relevance threshold (0.25)
5. Chunks injected into gpt-4o-mini system prompt, response streamed token-by-token via SSE

---

## Project Structure

```
LumoraAI/
├── frontend/                  # React 19 + Vite app
│   ├── src/
│   │   ├── app/               # App entry, router, global CSS
│   │   ├── features/          # Page-level feature components
│   │   │   ├── auth/          # Login, Register, Landing
│   │   │   ├── chat/          # Chat UI, streaming, sources panel
│   │   │   ├── documents/     # Upload modal, documents list
│   │   │   ├── pdf/           # PDF viewer (blob URL + react-pdf)
│   │   │   └── settings/      # Fully wired settings page
│   │   ├── hooks/             # useChat (SSE), useDocuments, useUpload
│   │   ├── store/             # Zustand: auth, chat, document, UI
│   │   ├── services/          # API client (axios + fetch SSE)
│   │   └── layouts/           # AppShell, Sidebar, AuthLayout
│   └── tailwind.config.ts     # CSS variable-driven color tokens
│
└── backend/                   # FastAPI app
    ├── app/
    │   ├── api/v1/endpoints/  # documents, chat, health routes
    │   ├── rag/               # chunking, embeddings, retriever, generator
    │   ├── services/          # document_service, chat_service, storage_service
    │   ├── firebase/          # Firestore + dev_store fallback
    │   └── workers/           # Background document processor
    ├── .env.example           # Environment variable template
    └── requirements.txt
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- An OpenAI API key

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS/Linux

pip install -r requirements.txt

cp .env.example .env
# Edit .env — add your OPENAI_API_KEY
# DEV_MODE=true means Firebase is not required

python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

### Dev mode login
With `DEV_MODE=true`, any email/password combination works on the login page.

---

## Environment Variables

See `backend/.env.example` for the full list. The minimum required for local dev:

```env
DEV_MODE=true
OPENAI_API_KEY=sk-...your-key
```

All other values have working defaults for local development.

---

## Author

**Vasanth Ponukumati**
[GitHub](https://github.com/PVSVASANTH2004) · ponukumativasanth@gmail.com
