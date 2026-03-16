from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import config, generate, export
from app.core.settings import settings

app = FastAPI(
    title="Synthetic Log Generator API",
    description="모바일 앱 사용자 행동 합성 로그 생성기",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(config.router, prefix="/api/config", tags=["Config"])
app.include_router(generate.router, prefix="/api/generate", tags=["Generate"])
app.include_router(export.router, prefix="/api/export", tags=["Export"])


@app.get("/health")
def health_check():
    return {"status": "ok"}
