from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from tools import generate_ppt_file

router = APIRouter()


@router.get("/ppt/")
async def generate_ppt(query: str = ""):
    """
    Generate a PowerPoint from uploaded documents and return it as a file download.
    """
    try:
        ppt_path = generate_ppt_file()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate presentation: {e}")

    return FileResponse(
        ppt_path,
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
        filename="presentation.pptx"
    )
