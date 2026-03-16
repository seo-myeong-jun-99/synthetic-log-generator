from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    ENV: str = "development"
    DATA_OUTPUT_PATH: str = "/data/output"
    DATA_SAMPLE_PATH: str = "/data/sample"
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"


settings = Settings()
