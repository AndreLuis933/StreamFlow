from google.cloud.firestore_v1 import FieldFilter
from src.config.firebase import db


def buscar_hashes_proximos(anime_nome: str, episodio_alvo: int, type_, janela: int = 30):
    ep_min = episodio_alvo - janela
    ep_max = episodio_alvo + janela

    hashes_ref = db.collection("animes").document(anime_nome).collection("hashes")

    query = (
        hashes_ref.where(filter=FieldFilter("episodio_base", ">=", ep_min))
        .where(filter=FieldFilter("episodio_base", "<=", ep_max))
        #.where(filter=FieldFilter("type", "==", type_))
        .order_by("episodio_base")
    )

    docs = query.get()

    candidatos = []
    for doc in docs:
        data = doc.to_dict()
        ep_base = data.get("episodio_base")
        if ep_min <= ep_base <= ep_max:
            candidatos.append(
                {
                    "doc_id": doc.id,
                    "episodio_base": ep_base,
                    "valido_de": data.get("valido_de"),
                    "valido_ate": data.get("valido_ate"),
                    "fingerprint_data": data["fingerprint_data"],
                },
            )

    # Ordena pelo mais próximo do episódio alvo
    candidatos.sort(key=lambda c: abs(c["episodio_base"] - episodio_alvo))
    return candidatos


def consult_seguement(nome, ep, type_):
    doc_ref = db.collection("animes").document(nome).collection(type_).document(ep)
    doc = doc_ref.get()
    if doc.exists:
        return doc.to_dict()
    return None
