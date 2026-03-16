"""POST /api/generate — 합성 로그 생성 실행"""
import uuid
from fastapi import APIRouter, HTTPException
from app.schemas.config_schema import GeneratorConfig, GenerateResponse
from app.services.session_pipeline import SessionPipeline
from app.services.output_service import save_json, save_csv, build_metadata

router = APIRouter()


@router.post("/run", response_model=GenerateResponse)
def run_generator(config: GeneratorConfig):
    """설정을 받아 합성 로그를 생성하고 파일로 저장"""
    try:
        job_id = uuid.uuid4().hex[:12]
        pipeline = SessionPipeline(config)
        events = pipeline.run()

        save_json(events, job_id)
        save_csv(events, job_id)
        meta = build_metadata(events, config.model_dump(), job_id)

        return GenerateResponse(
            job_id=job_id,
            status="success",
            total_sessions=meta["total_sessions"],
            total_events=meta["total_events"],
            output_file=f"{job_id}.json",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/preview")
def preview_generator(config: GeneratorConfig):
    """소규모 미리보기 (최대 10개 이벤트)"""
    config.session_config.sessions_per_day = 2
    pipeline = SessionPipeline(config)
    events = pipeline.run()
    return {"events": events[:10], "total_generated": len(events)}
