import os
from pathlib import Path

def read_secret(name: str, default: str | None = None) -> str:
    file_path = os.getenv(f"{name}_FILE")
    if file_path and Path(file_path).exists():
        return Path(file_path).read_text().strip()

    val = os.getenv(name, default)
    if val is None or val == "":
        raise RuntimeError(f"Missing environment variable: {name}")
    return val

OPENAI_API_KEY = read_secret("OPENAI_API_KEY")

