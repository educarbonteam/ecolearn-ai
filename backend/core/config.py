import os
from pathlib import Path
from typing import Optional

def _decode_secret_bytes(raw: bytes) -> str:
    # BOM UTF-16 LE / BE
    if raw.startswith(b"\xff\xfe"):
        return raw.decode("utf-16-le")
    if raw.startswith(b"\xfe\xff"):
        return raw.decode("utf-16-be")

    # BOM UTF-8
    if raw.startswith(b"\xef\xbb\xbf"):
        return raw.decode("utf-8-sig")

    # Sinon: on tente UTF-8 (standard)
    try:
        return raw.decode("utf-8")
    except UnicodeDecodeError:
        # Si ton fichier est UTF-16 SANS BOM (mauvais), on tente en dernier recours.
        # (Ça reste fragile : utf-16 sans BOM = ambigu)
        return raw.decode("utf-16")

def read_secret(name: str, default: Optional[str] = None) -> str:
    file_path = os.getenv(f"{name}_FILE")

    if file_path:
        p = Path(file_path)
        if p.exists() and p.is_file():
            raw = p.read_bytes()
            text = _decode_secret_bytes(raw)

            # Normalise fins de ligne + trim
            val = text.replace("\r\n", "\n").replace("\r", "\n").strip()
            if val:
                return val

    val = os.getenv(name, default)
    if not val:
        raise RuntimeError(f"Missing environment variable: {name}")
    return val.strip()

OPENAI_API_KEY = read_secret("OPENAI_API_KEY")