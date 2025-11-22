import base64
import json
import time
import zlib

from firebase_admin import firestore
from src.config.firebase import db


def save_to_firebase_hash(fingerprint: dict, anime_nome, episodio_base, type_):
    return
    episodio_base = int(episodio_base)  # garante que é número

    fingerprint_json = json.dumps(fingerprint)
    compressed = zlib.compress(fingerprint_json.encode("utf-8"))
    encoded = base64.b64encode(compressed).decode("utf-8")

    timestamp = int(time.time() * 1000)
    doc_id = f"hash_{episodio_base}_{timestamp}"

    doc_data = {
        "type": type_,
        "fingerprint_data": encoded,
        "episodio_base": episodio_base,
        "valido_de": episodio_base,
        "valido_ate": episodio_base,
        "usos_confirmados": [episodio_base],
        "criado_em": firestore.SERVER_TIMESTAMP,
        "ultima_atualizacao": firestore.SERVER_TIMESTAMP,
    }

    doc_ref = db.collection("animes").document(anime_nome).collection("hashes").document(doc_id)
    doc_ref.set(doc_data)


def atualizar_hash_uso(anime_nome: str, doc_id: str, episodio_novo: int):
    """Atualiza metadados quando um hash é reutilizado para outro episódio."""
    return
    doc_ref = db.collection("animes").document(anime_nome).collection("hashes").document(doc_id)
    doc = doc_ref.get()

    if not doc.exists:
        return

    data = doc.to_dict()

    # Atualiza intervalo
    valido_de = min(data.get("valido_de", episodio_novo), episodio_novo)
    valido_ate = max(data.get("valido_ate", episodio_novo), episodio_novo)

    # Adiciona aos usos confirmados
    usos = data.get("usos_confirmados", [])
    if episodio_novo not in usos:
        usos.append(episodio_novo)
        usos.sort()

    doc_ref.update(
        {
            "valido_de": valido_de,
            "valido_ate": valido_ate,
            "usos_confirmados": usos,
            "ultima_atualizacao": firestore.SERVER_TIMESTAMP,
        },
    )

    print(f"✓ Hash atualizado: intervalo [{valido_de}-{valido_ate}], usos: {usos}")


def save_to_firebase_result(fingerprint, nome, ep, type_):
    return
    doc_ref = db.collection("animes").document(nome).collection(type_)

    doc_ref.document(ep).set(fingerprint)
