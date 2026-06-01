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

    class Config:
        env_file = ".env"

settings = Settings()