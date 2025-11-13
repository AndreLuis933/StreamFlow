from __future__ import annotations

import json
import os
from collections import defaultdict


def build_hash_map(hashes: list[dict]) -> dict:
    d = defaultdict(list)
    for it in hashes:
        d[it["hash"]].append(float(it["time"]))
    return d

def load_fingerprint_map(json_path):
    """
    Carrega o JSON com os fingerprints do trecho-alvo.
    Retorna dict: {hash: [tempos]}
    """
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data.get("hashes", {})


def save_segment_fingerprints_json(segment_hashes: list[dict], outjson_path: str, metadata: dict|None = None) -> None:
    map_h = build_hash_map(segment_hashes)
    out = {"meta": metadata or {}, "hashes": map_h}
    os.makedirs(os.path.dirname(outjson_path) or ".", exist_ok=True)
    with open(outjson_path, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2)


def load_hash_json(path: str) -> dict:
    with open(path, encoding="utf-8") as f:
        return json.load(f)
