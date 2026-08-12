"""
Centralized Persistent Storage Module for CloudSpend Intelligence.

All runtime analytics files (Parquet datasets, DuckDB database, uploads) resolve
under the root DATA_DIR configuration (env var DATA_DIR).

Local default: ./data
Render Production: /opt/render/project/src/data (or Persistent Disk mount path)
"""
from __future__ import annotations
import uuid
from pathlib import Path
from typing import Optional

from .config import get_settings


def validate_dataset_id(dataset_id: str) -> str:
    """
    Validate that dataset_id is a valid UUID string to prevent path traversal attacks.
    Raises ValueError if invalid.
    """
    try:
        val = uuid.UUID(str(dataset_id))
        return str(val)
    except (ValueError, AttributeError, TypeError):
        raise ValueError(f"Invalid dataset ID format: {dataset_id}")


def get_data_dir() -> Path:
    """Return resolved root DATA_DIR directory (creating if missing)."""
    settings = get_settings()
    data_dir = Path(settings.data_dir).resolve()
    data_dir.mkdir(parents=True, exist_ok=True)
    return data_dir


def get_parquet_dir() -> Path:
    """Return resolved parquet base directory under DATA_DIR."""
    parquet_dir = get_data_dir() / "parquet"
    parquet_dir.mkdir(parents=True, exist_ok=True)
    return parquet_dir


def get_uploads_dir() -> Path:
    """Return resolved uploads directory under DATA_DIR."""
    uploads_dir = get_data_dir() / "uploads"
    uploads_dir.mkdir(parents=True, exist_ok=True)
    return uploads_dir


def get_duckdb_path() -> Path:
    """Return resolved DuckDB file path under DATA_DIR."""
    return get_data_dir() / "cloudspend.duckdb"


def get_dataset_dir(dataset_id: str) -> Path:
    """Return resolved directory for a specific dataset."""
    valid_id = validate_dataset_id(dataset_id)
    dataset_dir = get_parquet_dir() / valid_id
    return dataset_dir


def get_dataset_parquet_path(dataset_id: str) -> Path:
    """Return resolved Parquet file path for a specific dataset."""
    return get_dataset_dir(dataset_id) / "data.parquet"


def get_relative_parquet_key(dataset_id: str) -> str:
    """Return environment-independent relative storage key for database storage."""
    valid_id = validate_dataset_id(dataset_id)
    return f"parquet/{valid_id}/data.parquet"


def verify_dataset_parquet_exists(dataset_id: str) -> tuple[bool, Optional[str]]:
    """
    Verify that the dataset Parquet file exists, is a regular file, and is non-empty.
    Returns (True, None) if valid, or (False, error_reason) if invalid.
    """
    try:
        parquet_path = get_dataset_parquet_path(dataset_id)
        if not parquet_path.exists():
            return False, f"Parquet file missing at {parquet_path}"
        if not parquet_path.is_file():
            return False, f"Path at {parquet_path} is not a regular file"
        if parquet_path.stat().st_size == 0:
            return False, f"Parquet file at {parquet_path} is empty (0 bytes)"
        return True, None
    except Exception as e:
        return False, str(e)
