from typing import Optional

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    openai_api_key: str
    secret_key: str
    upload_dir: str = "./uploads"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7
    
   # Optional — only needed for production S3/R2
    s3_bucket: Optional[str] = None
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    aws_region: Optional[str] = None
    s3_endpoint_url: Optional[str] = None
    openrouter_api_key: Optional[str] = None
    app_url: str = "http://localhost:5173"
    hf_token: Optional[str] = None
    
    @property
    def async_database_url(self) -> str:
        """Always return asyncpg-compatible URL for Neon"""
        return self.database_url.replace(
            "postgresql://", "postgresql+asyncpg://"
        ).replace(
            "postgres://", "postgresql+asyncpg://"  # ✅ Neon sometimes gives postgres://
        )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()