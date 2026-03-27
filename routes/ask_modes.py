from fastapi import APIRouter
from tools import _rag_query, direct_query

router = APIRouter()


@router.get("/ask_rag/")
async def ask_rag(query: str):
    return _rag_query(query)


@router.get("/ask_direct/")
async def ask_direct(query: str):
    return {"answer": direct_query(query)}
