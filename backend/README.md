# DocuMind AI — FastAPI Backend

Production-grade RAG (Retrieval-Augmented Generation) API for the DocuMind AI document assistant.

## Architecture

```
app/
├── api/v1/endpoints/   ← HTTP route handlers (documents, chat, health)
├── auth/               ← Firebase JWT verification + FastAPI dependency
├── core/               ← Config (pydantic-settings), logging (structlog), exceptions
├── rag/
│   ├── loaders/        ← PyMuPDF PDF text extraction
│   ├── chunking/       ← Recursive character text splitter
│   ├── embeddings/     ← sentence-transformers bge-small-en-v1.5
│   ├── retriever/      ← ChromaDB vector store queries
│   ├── prompts/        ← System + user prompt templates
│   ├── generator/      ← Gemini 2.5 Flash streaming via LangChain
│   └── citations/      ← Source citation builder
├── services/           ← Business logic (DocumentService, ChatService)
├── firebase/           ← Firestore async wrappers + Storage client
├── chroma/             ← ChromaDB client + collection naming
├── middleware/         ← CORS, request logging
├── models/             ← Internal Pydantic models
├── schemas/            ← API request/response schemas
└── workers/            ← Background document processor
```

## Quick Start

### 1. Prerequisites
- Python 3.12+
- Firebase project (for Auth + Firestore + Storage)
- Google AI API key (Gemini 2.5 Flash)

### 2. Environment Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your credentials
```

Place your Firebase service account JSON at `./firebase-service-account.json`.

### 3. Run Locally

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

uvicorn app.main:app --reload --port 8000
```

Open **http://localhost:8000/docs** for the Swagger UI.

### 4. Run with Docker

```bash
docker compose up --build
```

### 5. Run Tests

```bash
pytest tests/ -v
```

---

## API Reference

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/health` | ❌ | Health check |
| `POST` | `/api/v1/documents/upload` | ✅ | Upload document (async processing) |
| `GET` | `/api/v1/documents` | ✅ | List documents |
| `GET` | `/api/v1/documents/{id}` | ✅ | Document details |
| `GET` | `/api/v1/documents/{id}/status` | ✅ | Poll processing status |
| `DELETE` | `/api/v1/documents/{id}` | ✅ | Delete document + embeddings |
| `POST` | `/api/v1/chat/sessions` | ✅ | Create chat session |
| `GET` | `/api/v1/chat/sessions` | ✅ | List sessions |
| `GET` | `/api/v1/chat/sessions/{id}` | ✅ | Session + message history |
| `DELETE` | `/api/v1/chat/sessions/{id}` | ✅ | Delete session |
| `POST` | `/api/v1/chat/sessions/{id}/messages` | ✅ | **Streaming** AI chat (SSE) |
| `POST` | `/api/v1/chat/sessions/{id}/messages/{mid}/feedback` | ✅ | Thumbs up/down |

### Authentication

All protected endpoints require a Firebase ID token:
```
Authorization: Bearer <firebase-id-token>
```

### Streaming Chat — SSE Protocol

```
POST /api/v1/chat/sessions/{session_id}/messages
Content-Type: application/json
Authorization: Bearer <token>

{"content": "What are the key findings?"}
```

SSE events streamed back:
```
data: {"type": "delta", "content": "The "}
data: {"type": "delta", "content": "key "}
...
data: {"type": "sources", "sources": [{
    "document_id": "...",
    "document_name": "Report.pdf",
    "page_number": 4,
    "score": 0.94,
    "snippet": "...",
    "chunk_index": 12
}]}
data: {"type": "done", "message_id": "..."}
```

---

## Configuration

All settings via environment variables (see `.env.example`):

| Variable | Default | Description |
|----------|---------|-------------|
| `GOOGLE_API_KEY` | — | Gemini API key |
| `GEMINI_MODEL` | `gemini-2.5-flash` | LLM model name |
| `EMBEDDING_MODEL` | `BAAI/bge-small-en-v1.5` | HuggingFace model |
| `CHUNK_SIZE` | `800` | Characters per chunk |
| `CHUNK_OVERLAP` | `150` | Overlap between chunks |
| `RETRIEVAL_TOP_K` | `6` | Max chunks retrieved per query |
| `RETRIEVAL_SCORE_THRESHOLD` | `0.35` | Min cosine similarity |
| `CHROMA_PERSIST_DIR` | `./chroma_data` | ChromaDB storage path |

---

## Design Decisions

**Per-document ChromaDB collections**: Each document gets its own collection, enabling fast deletion and clean multi-document filtering without complex where-clauses.

**BGE query prefix**: `bge-small-en-v1.5` requires an instruction prefix for query embeddings (`"Represent this sentence for searching relevant passages: "`). Documents are embedded without prefix. This asymmetric embedding is intentional and significantly improves retrieval quality.

**Firebase Firestore for chat history**: Firestore provides real-time capable, scalable sub-collection storage. Messages are stored as a sub-collection under each session, not as an array field, to avoid Firestore's 1MB document limit.

**Streaming via LangChain + SSE**: LangChain's `astream` yields token chunks; these are forwarded as Server-Sent Events. The frontend consumes them with `EventSource` or `fetch` with streaming body.
