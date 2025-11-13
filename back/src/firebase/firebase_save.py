import base64
import json
import zlib

from ..config.firebase import db


def save_to_firebase_hash(fingerprint: dict, nome):
    fingerprint_json = json.dumps(fingerprint)
    compressed = zlib.compress(fingerprint_json.encode("utf-8"))
    encoded = base64.b64encode(compressed).decode("utf-8")
    doc_ref = db.collection("animes").document(nome).collection("hash").document("teste")
    doc_ref.set({"data": encoded})


def save_to_firebase_intro(fingerprint, nome, ep):
    doc_ref = db.collection("animes").document(nome).collection("intro")

    doc_ref.document(ep).set(fingerprint)
