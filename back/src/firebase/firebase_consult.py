import base64
import json
import zlib

from ..config.firebase import db


def consult_hash(nome):
    doc_ref = db.collection("animes").document(nome).collection("hash").document("teste")
    doc = doc_ref.get()
    if doc.exists:
        data = doc.to_dict()
        encoded = data.get("data")
        if encoded:
            compressed = base64.b64decode(encoded)
            json_bytes = zlib.decompress(compressed)
            return json.loads(json_bytes.decode("utf-8"))
    return None


def consult_intro(nome, ep):
    doc_ref = db.collection("animes").document(nome).collection("intro").document(ep)
    doc = doc_ref.get()
    if doc.exists:
        return doc.to_dict()
    return None
