from langchain_classic.chains import RetrievalQA
from langchain_core.prompts import PromptTemplate
from vectorstore import get_vectorstore, all_docs
from config import answer_llm, embeddings
from ppt_service import create_ppt
import json

DOCUMENT_QA_TOOL_NAME  = "document_qa_tool"
GENERAL_CHAT_TOOL_NAME = "general_chat_tool"

QA_PROMPT = PromptTemplate(
    template="""You are an expert research assistant. Use the retrieved passages below to answer the question accurately and in depth.

Guidelines:
- Read ALL passages before forming your answer
- Identify and explain the document's main contributions and key ideas
- Synthesize information across passages — do not just quote one passage
- Be specific, structured, and thorough
- If the context is genuinely insufficient, say so clearly

Retrieved passages:
{context}

Question: {question}

Answer:""",
    input_variables=["context", "question"]
)


def _rag_query(query: str) -> dict:
    if not all_docs:
        return {
            "answer": "No documents have been uploaded yet. Please upload a PDF first.",
            "tool": DOCUMENT_QA_TOOL_NAME,
            "source_file": None,
            "chunks": []
        }

    vs = get_vectorstore(embeddings)
    retriever = vs.as_retriever(
        search_type="mmr",
        search_kwargs={"k": 6, "fetch_k": 20}
    )
    qa = RetrievalQA.from_chain_type(
        llm=answer_llm,
        retriever=retriever,
        return_source_documents=True,
        chain_type_kwargs={"prompt": QA_PROMPT}
    )
    result = qa.invoke({"query": query})
    answer = result.get("result", "")
    source_docs = result.get("source_documents", []) or []

    chunks = []
    seen_content = set()
    source_file = None
    for doc in source_docs:
        content = doc.page_content.strip()
        if not content or content in seen_content:
            continue
        seen_content.add(content)
        meta = getattr(doc, "metadata", {}) or {}
        page = meta.get("page")
        src = meta.get("source") or meta.get("file_name") or "document"
        if source_file is None:
            source_file = src
        chunks.append({
            "content": content,
            "page": (page + 1) if isinstance(page, int) else (page or "?")
        })

    return {
        "answer": answer,
        "tool": DOCUMENT_QA_TOOL_NAME,
        "source_file": source_file or "uploaded_document",
        "chunks": chunks
    }


def direct_query(query: str) -> str:
    result = answer_llm.invoke(query)
    return result.content if hasattr(result, "content") else str(result)


def generate_ppt_file() -> str:
    if not all_docs:
        raise ValueError("No documents uploaded")

    MAX_CHARS = 12_000
    combined = ""
    for doc in all_docs:
        chunk = doc.page_content.strip()
        if not chunk:
            continue
        combined += chunk + "\n\n"
        if len(combined) >= MAX_CHARS:
            break

    slide_prompt = f"""You are a presentation designer. Convert the content below into a PowerPoint slide deck.

RULES:
- Return ONLY valid JSON — no markdown fences, no extra text
- 6 to 10 slides total
- First slide is an overview/title slide
- Last slide is a conclusion or key takeaways slide
- EXACTLY ONE slide must be a comparison table slide — it must have a "table" key instead of "bullets"
- All other slides use "bullets" (3–5 concise points each)
- Place the table slide somewhere in the middle of the deck

SLIDE FORMATS:

Bullet slide:
{{"title": "Slide title", "bullets": ["point 1", "point 2", "point 3"]}}

Table slide (required, exactly once):
{{"title": "Comparison", "table": {{"headers": ["Aspect", "Option A", "Option B"], "rows": [["Row 1", "val", "val"], ["Row 2", "val", "val"]]}}}}

The table must compare at least 2 meaningful dimensions from the content (e.g. methods, models, approaches, metrics, concepts).

OUTPUT FORMAT:
{{
  "slides": [ ...slide objects... ]
}}

Content:
{combined}
"""

    result = answer_llm.invoke(slide_prompt)
    content = result.content if hasattr(result, "content") else str(result)

    if isinstance(content, list):
        content = " ".join(str(x) for x in content)

    content = content.replace("```json", "").replace("```", "").strip()
    slides_json = json.loads(content)

    if not slides_json.get("slides"):
        raise ValueError("LLM returned no slides")

    return create_ppt(slides_json)
