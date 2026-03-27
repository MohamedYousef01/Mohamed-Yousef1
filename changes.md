# Changelog

## Session — 2026-03-27

### Bug Fixes

#### `agent.py`
- Replaced non-existent `from langchain.agents import create_agent` with `from langgraph.prebuilt import create_react_agent`
- Fixed agent instantiation to use `create_react_agent(model=..., tools=..., prompt=...)` — the `/ask/` and `/AskMoreInfo/` routes were completely broken before this

#### `tools.py`
- Fixed `ppt_tool` guard from `if "all_docs" not in globals() or not all_docs` → `if not all_docs` (the `globals()` check was always `True` and meaningless)
- Added empty-vectorstore guard to `search_tool` — previously queried an empty Chroma store silently and returned hallucinated answers
- Changed bare `except:` to `except Exception:` in slide generation loop (was swallowing `KeyboardInterrupt`, `SystemExit`, etc.)
- Fixed `from langchain.prompts import PromptTemplate` → `from langchain_core.prompts import PromptTemplate` (module moved in newer LangChain)

#### `pdf_service.py`
- Removed redundant `get_vectorstore()` call after `reset_vectorstore()` — was reassigning the same instance
- Removed unused `get_vectorstore` import
- Wrapped PDF processing in `try/finally` to guarantee temp file cleanup on failure (previously leaked temp files on any exception)

#### `vectorstore.py`
- Added `persist_directory="chroma_store"` to both `reset_vectorstore` and `get_vectorstore` — vector store was in-memory only, all uploaded documents were lost on server restart
- `reset_vectorstore` now deletes the `chroma_store/` directory before recreating, ensuring a clean state on new upload

#### `routes/ppt.py`
- Added `HTTPException(status_code=500)` when `ppt_tool` returns an error dict — previously returned HTTP 200 with an error body, causing the frontend to treat it as success and try to download JSON as a `.pptx` file

#### `routes/qa.py`
- Added null-safety on agent result: `result.get("messages", [])` with empty-list guard
- Used `hasattr(last, "content")` check before accessing `.content` to avoid `AttributeError`

#### `main.py`
- Expanded CORS `allow_origins` to include `http://localhost:5500`, `http://127.0.0.1:5500`, and `"null"` to support VS Code Live Server and file-based serving

---

### Improvements

#### `tools.py` — RAG quality
- Extracted `_rag_query(query)` as an internal function returning structured `{ answer, tool, source_file, chunks[] }` — separates retrieval logic from LangChain tool wrapper
- Switched retriever from plain similarity (`k=4`) to **MMR** (`search_type="mmr"`, `k=6`, `fetch_k=20`) — fetches 20 candidates then selects the 6 most diverse, preventing all chunks from coming from the same section of the document
- Added custom `QA_PROMPT` (`PromptTemplate`) that instructs the LLM to synthesise across all passages and focus on main contributions rather than just the first retrieved chunk
- `search_tool` now delegates to `_rag_query()` and formats result as a plain string for LangChain agent compatibility

#### `routes/ask_modes.py`
- `/ask_rag/` now calls `_rag_query()` directly and returns structured JSON `{ answer, tool, source_file, chunks[] }` instead of a raw formatted string

---

### Frontend — full rebuild

#### Deleted
- Removed broken `ai-frontend/` (Create React App) — had unresolvable `react-scripts` install issues

#### New `frontend/` — Vite + React
- Migrated from CRA to **Vite** (`@vitejs/plugin-react`) — lighter, faster, no `react-scripts` dependency
- App renamed to **llm-project** throughout (`package.json`, title, logo)
- Dev server configured to port `3000` in `vite.config.js`

#### Layout redesign (`App.jsx`, `App.css`)
- Two-panel layout: left sidebar (272px) + chat main area
- Animated background orbs (teal, blue, amber) via CSS keyframes
- Full glassmorphism — `backdrop-filter: blur()` on sidebar, chat header, input bar
- Font changed to **Outfit** (Google Fonts) + **DM Mono** for metadata

#### Sidebar
- Star logo with teal→blue gradient, app name "llm-project"
- Drag-and-drop PDF upload zone with visual state (idle / drag-over / file-selected)
- Upload button disabled until file selected; shows spinner during upload
- Mode toggle: PDF Source (RAG) / Direct LLM as button group with active glow
- Generate Slides button disabled until a PDF has been uploaded
- Typed status badges: green (success), red (error), blue (info) with matching icons
- Model/tech footer: "Gemma3 · 27B · Chroma RAG"

#### Chat area
- Header bar with "Document loaded" badge (appears after successful upload) and active mode pill
- Auto-scroll to latest message via `useRef` + `useEffect`
- Messages animate in with `fadeUp` keyframe
- User bubbles: teal→blue gradient; AI bubbles: dark glass with border
- Typing indicator: three bouncing teal dots while waiting for response
- Error bubbles styled in red

#### Sources panel (`App.jsx`, `App.css`)
- Slide-in right panel (300px) showing retrieved RAG chunks
- Auto-opens when a RAG response includes chunks
- Shows: tool name, source file, chunk count
- Each chunk is a collapsible card with page number badge (amber) and chevron toggle
- "N chunks retrieved" button below each RAG message bubble to reopen panel
- Close button (×) dismisses panel
- Clicking a different message's chunks button swaps panel content

#### Input
- Rounded pill input bar with teal focus ring glow
- Circular send button with arrow-up icon
- Enter to send, Shift+Enter for newline

---

### New Files

| File | Purpose |
|------|---------|
| `run.py` | Start backend with `python run.py` instead of the full uvicorn command |
| `project_map.json` | Full project map: all files, functions, interconnections, data flows |
| `frontend/vite.config.js` | Vite config — React plugin, port 3000 |
| `frontend/src/main.jsx` | React DOM entry point |
| `frontend/src/App.jsx` | Main React component — all UI and logic |
| `frontend/src/App.css` | All styles — variables, layout, components, animations |
| `frontend/src/index.css` | Global body reset |

---

### Deleted Files

| File | Reason |
|------|--------|
| `ai-frontend/` (entire directory) | Replaced by `frontend/` (Vite) — CRA had broken `react-scripts` install |
| `frontend/index.html` (plain HTML version) | Replaced by Vite entry point |
| `frontend/style.css` | Styles moved to `frontend/src/App.css` |
| `frontend/app.js` | Logic moved to `frontend/src/App.jsx` |
