from fastapi import APIRouter, UploadFile
from pdf_service import process_pdf
from config import embeddings

router = APIRouter()

@router.post("/upload_pdf/")
async def upload_pdf(file: UploadFile):
    chunks, total = process_pdf(await file.read(), embeddings)

    return {
        "status": "PDF processed",
        "chunks_added": chunks,
        "total_chunks": total
    }