"""GET/POST /api/config — 설정 저장 및 불러오기"""
import json, os
from fastapi import APIRouter, HTTPException
from app.schemas.config_schema import GeneratorConfig
from app.core.settings import settings

router = APIRouter()
_CONFIG_PATH = "/tmp/last_config.json"   # 간단 파일 기반 저장 (DB 없음)


@router.get("/default", response_model=GeneratorConfig)
def get_default_config():
    """기본 설정값 반환"""
    return GeneratorConfig()


@router.post("/save")
def save_config(config: GeneratorConfig):
    """현재 설정 저장"""
    with open(_CONFIG_PATH, "w") as f:
        f.write(config.model_dump_json(indent=2))
    return {"message": "saved"}


@router.get("/load", response_model=GeneratorConfig)
def load_config():
    """마지막 저장 설정 불러오기"""
    if not os.path.exists(_CONFIG_PATH):
        raise HTTPException(404, "저장된 설정이 없습니다.")
    with open(_CONFIG_PATH) as f:
        return GeneratorConfig(**json.load(f))
