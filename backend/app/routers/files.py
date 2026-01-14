from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.services.openai_files import upload_file_to_openai

router = APIRouter(prefix="/files", tags=["Files"])

@router.post("/upload")
async def upload(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        # ✅ Upload to OpenAI Files API (or store locally if you want)
        result = await upload_file_to_openai(file)
        return {
            "filename": file.filename,
            "openai_file_id": result["id"],  # returned file ID
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
