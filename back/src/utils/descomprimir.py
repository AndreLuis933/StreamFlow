import base64
import json
import zlib


def descomprimir_fingerprint(encoded: str) -> dict:
    """Descomprime o fingerprint codificado."""
    compressed = base64.b64decode(encoded)
    json_bytes = zlib.decompress(compressed)
    return json.loads(json_bytes.decode("utf-8"))
