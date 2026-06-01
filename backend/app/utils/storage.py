import boto3
import uuid
import os
from app.core.config import settings

def get_s3_client():
    kwargs = {
        "aws_access_key_id":     settings.aws_access_key_id,
        "aws_secret_access_key": settings.aws_secret_access_key,
        "region_name":           settings.aws_region or "auto",
    }
    # R2 or custom S3-compatible endpoint
    if settings.s3_endpoint_url:
        kwargs["endpoint_url"] = settings.s3_endpoint_url

    return boto3.client("s3", **kwargs)

async def upload_to_s3(file_bytes: bytes, filename: str, content_type: str) -> tuple[str, str]:
    """
    Uploads file bytes to S3/R2.
    Returns (s3_key, public_url).
    """
    ext     = filename.rsplit(".", 1)[-1] if "." in filename else "bin"
    s3_key  = f"uploads/{uuid.uuid4()}.{ext}"

    client = get_s3_client()
    client.put_object(
        Bucket=      settings.s3_bucket,
        Key=         s3_key,
        Body=        file_bytes,
        ContentType= content_type,
    )

    # Build the URL
    if settings.s3_endpoint_url:
        url = f"{settings.s3_endpoint_url}/{settings.s3_bucket}/{s3_key}"
    else:
        url = f"https://{settings.s3_bucket}.s3.{settings.aws_region}.amazonaws.com/{s3_key}"

    return s3_key, url

def download_from_s3(s3_key: str, local_path: str):
    """Downloads an S3 object to a local temp path for ingestion."""
    client = get_s3_client()
    client.download_file(settings.s3_bucket, s3_key, local_path)

def delete_from_s3(s3_key: str):
    """Deletes an object from S3/R2."""
    try:
        client = get_s3_client()
        client.delete_object(Bucket=settings.s3_bucket, Key=s3_key)
    except Exception as e:
        print(f"S3 delete failed for {s3_key}: {e}")