from fastapi import APIRouter
from config import router_llm
from tools import _rag_query, DOCUMENT_QA_TOOL_NAME, GENERAL_CHAT_TOOL_NAME
from vectorstore import all_docs

router = APIRouter()

ROUTE_PROMPT = """You are a routing assistant. Decide whether the user's question requires searching an uploaded document or can be answered from general knowledge.

Reply with exactly one word — either "document" or "direct" — nothing else.

Answer "document" if the question is about specific content, facts, or details likely found in an uploaded document.
Answer "direct" if the question is general knowledge, a greeting, or unrelated to any document.

Question: {query}
Decision:"""


@router.get("/ask/")
async def ask(query: str):
    # Step 1: classify intent
    tool_used = None
    try:
        if all_docs:
            prompt = ROUTE_PROMPT.format(query=query)
            decision_msg = router_llm.invoke(prompt)
            decision = (decision_msg.content if hasattr(decision_msg, "content") else str(decision_msg)).strip().lower()
            use_doc = decision.startswith("document")
        else:
            use_doc = False
    except Exception:
        use_doc = False

    # Step 2: route to the right function
    if use_doc:
        result = _rag_query(query)
        return {"answer": result["answer"], "tool_used": DOCUMENT_QA_TOOL_NAME}
    else:
        msg = router_llm.invoke(query)
        answer = msg.content if hasattr(msg, "content") else str(msg)
        return {"answer": answer, "tool_used": GENERAL_CHAT_TOOL_NAME}
