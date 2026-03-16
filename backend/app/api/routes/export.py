"""GET /api/export — 생성된 파일 다운로드"""
import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from app.core.settings import settings

router = APIRouter()


@router.get("/json/{job_id}")
def download_json(job_id: str):
    path = os.path.join(settings.DATA_OUTPUT_PATH, f"{job_id}.json")
    if not os.path.exists(path):
        raise HTTPException(404, "파일을 찾을 수 없습니다.")
    return FileResponse(path, media_type="application/json", filename=f"{job_id}.json")


@router.get("/csv/{job_id}")
def download_csv(job_id: str):
    path = os.path.join(settings.DATA_OUTPUT_PATH, f"{job_id}.csv")
    if not os.path.exists(path):
        raise HTTPException(404, "파일을 찾을 수 없습니다.")
    return FileResponse(path, media_type="text/csv", filename=f"{job_id}.csv")


@router.get("/list")
def list_outputs():
    """생성된 파일 목록 조회"""
    out_dir = settings.DATA_OUTPUT_PATH
    if not os.path.exists(out_dir):
        return {"files": []}
    files = [f for f in os.listdir(out_dir) if f.endswith((".json", ".csv"))]
    return {"files": sorted(files, reverse=True)}
