# Dawla — AI Document Assistant

A full-stack AI application for intelligent document analysis and presentation generation. Upload a PDF, ask questions about it using RAG, or chat directly with the LLM — then export the document's content as a PowerPoint presentation.

---

## Features

- **PDF Upload & Indexing** — Upload any PDF and it gets chunked, embedded, and stored in a local Chroma vector store
- **RAG Question Answering** — Ask questions about your document using Retrieval-Augmented Generation with MMR retrieval and a custom synthesis prompt
- **Direct LLM Chat** — Ask general questions directly from the model without document retrieval
- **PowerPoint Generation** — Automatically summarise the uploaded document and generate a structured `.pptx` presentation
- **Sources Panel** — Every RAG answer shows the exact chunks retrieved, with page numbers, in an expandable side panel
- **Intelligent Agent** — A LangGraph agent that automatically routes queries to the right tool

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, FastAPI |
| AI / LLM | Ollama — Gemma3 27B (chat), BGE-M3 (embeddings) |
| RAG | LangChain, Chroma (vector store) |
| Agent | LangGraph `create_react_agent` |
| PPT Generation | python-pptx |
| Frontend | React 19, Vite |

---

## Project Structure

```
Dawla/
├── main.py              # FastAPI app — registers all routers
├── config.py            # LLM + embeddings config (shared globals)
├── agent.py             # LangGraph agent with tool routing
├── tools.py             # LangChain tools: RAG, direct LLM, PPT
├── vectorstore.py       # Chroma vector store management
├── pdf_service.py       # PDF loading, chunking, indexing pipeline
├── ppt_service.py       # Slide JSON → .pptx file generation
├── run.py               # Backend entry point (python run.py)
├── changes.md           # Full session changelog
├── project_map.json     # Auto-generated project map (files, functions, flows)
│
├── routes/
│   ├── upload.py        # POST /upload_pdf/
│   ├── ask_modes.py     # GET /ask_rag/  GET /ask_direct/
│   ├── qa.py            # GET /ask/  GET /AskMoreInfo/  (agent routes)
│   ├── ppt.py           # GET /ppt/
│   └── summarize.py     # GET /summarize  (placeholder)
│
└── frontend/
    ├── index.html       # Vite entry point
    ├── vite.config.js   # Vite config — port 3000
    ├── package.json     # name: llm-project
    └── src/
        ├── main.jsx     # React DOM root
        ├── App.jsx      # All components and logic
        ├── App.css      # Full design system
        └── index.css    # Global body reset
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/upload_pdf/` | Upload and index a PDF |
| `GET` | `/ask_rag/?query=` | RAG answer with retrieved chunks |
| `GET` | `/ask_direct/?query=` | Direct LLM answer |
| `GET` | `/ask/?query=` | Agent-routed answer (auto-selects tool) |
| `GET` | `/ppt/` | Generate and download `.pptx` from uploaded doc |
| `GET` | `/summarize` | *(Not implemented yet)* |

---

## How RAG Works

```
User query
    │
    ▼
Chroma vector store
    │  fetch_k=20 candidates by cosine similarity
    ▼
MMR selection (Maximal Marginal Relevance)
    │  k=6 most diverse chunks
    ▼
Custom QA prompt
    │  instructs LLM to synthesise across all passages
    ▼
Gemma3 27B → answer
    │
    ▼
Response: { answer, tool, source_file, chunks[] }
```

MMR is used instead of plain top-k similarity to avoid retrieving multiple near-identical chunks from the same section of the document.

---

## How PPT Generation Works

```
Uploaded document chunks
    │
    ▼
map_reduce summarisation chain → full document summary
    │
    ▼
Split summary into ~600 char segments
    │
    ▼
For each segment → LLM generates { title, bullets[] } JSON
    │
    ▼
python-pptx assembles slides → presentation.pptx
```

---

## Setup

### Prerequisites

- Python 3.10+
- [Ollama](https://ollama.ai) running locally with:
  - `ollama pull gemma3:27b-cloud`
  - `ollama pull bge-m3:latest` *(or whichever embedding model is configured in `config.py`)*
- Node.js 18+

### Backend

```bash
pip install fastapi uvicorn langchain langchain-community langchain-chroma \
            langchain-ollama langchain-core langgraph langchain-classic \
            python-pptx pypdf
```

```bash
python run.py
# → http://127.0.0.1:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

---

## Frontend Overview

The UI is built with React + Vite and features:

- **Left sidebar** — PDF upload (drag & drop), answer mode toggle, PPT export, status badges
- **Chat area** — message history with user/AI bubbles, typing indicator, auto-scroll
- **Sources panel** — slide-in right panel showing retrieved chunks per RAG answer, each collapsible with page number

No external UI libraries — pure CSS with glassmorphism, animated background orbs, and the Outfit + DM Mono font pairing.

---

## Agent Routing Logic

The LangGraph agent (`/ask/` endpoint) automatically selects a tool based on the query:

| Condition | Tool used |
|-----------|-----------|
| Query mentions PowerPoint / slides / presentation | `slides_generator_tool` |
| Document uploaded + document-related question | `document_qa_tool` |
| General question | `general_chat_tool` |

The `/ask_rag/` and `/ask_direct/` endpoints bypass the agent and call tools directly for predictable behaviour.
