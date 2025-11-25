from __future__ import annotations

from typing import TYPE_CHECKING

from config.config import (
    DT_BUCKET_MS,
    FAN_VALUE,
    GAP_THRESHOLD_S,
    HOP_LENGTH,
    MAX_DT_S,
    MIN_DURATION_SEC,
    N_FFT,
    PEAK_NEIGHBORHOOD_SIZE,
    SR_TARGET,
)
from config.loggin import measure_time
from firebase.firebase_save import save_to_firebase_hash, save_to_firebase_result

from .fingerprint import fingerprint_audio_array
from .matcher import build_hash_map, match_fingerprints_and_estimate_duration

if TYPE_CHECKING:
    import numpy as np


def extract_and_save_common_segment(
    reference_audio_bytes: np.ndarray,
    query_audio_bytes: np.ndarray,
    anime: str,
    ep_target: str,
    type_: str,
    start_offset: float,
    out_audio_path: str | None = None,
) -> dict[str, float] | None:
    """Compara dois áudios, encontra o segmento comum, salva o recorte
    e persiste os hashes no Firebase.
    """
    # 1. Gerar Fingerprints
    with measure_time("Finguer print 1"):
        ref_hashes = fingerprint_audio_array(
            reference_audio_bytes,
            sr=SR_TARGET,
            n_fft=N_FFT,
            hop_length=HOP_LENGTH,
            fan_value=FAN_VALUE,
            peak_neighborhood_size=PEAK_NEIGHBORHOOD_SIZE,
            max_dt_s=MAX_DT_S,
        )
    with measure_time("Finguer print 2"):
        query_hashes= fingerprint_audio_array(
            query_audio_bytes,
            sr=SR_TARGET,
            n_fft=N_FFT,
            hop_length=HOP_LENGTH,
            fan_value=FAN_VALUE,
            peak_neighborhood_size=PEAK_NEIGHBORHOOD_SIZE,
            max_dt_s=MAX_DT_S,
        )

    # 2. Realizar o Match

    stored_map = build_hash_map(ref_hashes)

    match_res = match_fingerprints_and_estimate_duration(
        stored_map,
        query_hashes,
        dt_bucket_ms=DT_BUCKET_MS,
        gap_threshold_s=GAP_THRESHOLD_S,
    )

    if not match_res:
        print("Nenhuma correspondência encontrada entre os arquivos.")
        return None

    duration = match_res["duration_est_sec"]
    start_stored = match_res["start_stored_sec"]
    end_stored = start_stored + duration

    if duration < MIN_DURATION_SEC:
        print(f"Duração estimada muito curta ({duration:.2f}s)")
        return None

    # 3. Filtrar Hashes do Segmento
    seg_hashes = _filter_hashes_by_time(ref_hashes, start_stored, end_stored)

    if not seg_hashes:
        print("Nenhum hash encontrado no segmento recortado.")
        return None

    # 4. Salvar Áudio Físico (se solicitado)
    if out_audio_path:
        start_sample = max(0, int(round(start_stored * SR_TARGET)))
        end_sample = min(len(reference_audio_bytes), int(round(end_stored * SR_TARGET)))
        segment_audio = reference_audio_bytes[start_sample:end_sample]

        if segment_audio.size > 0:
            import soundfile as sf
            sf.write(out_audio_path, segment_audio, SR_TARGET)

    # 5. Salvar no Firebase
    map_h = build_hash_map(seg_hashes)
    save_to_firebase_hash(map_h, anime, ep_target, type_)

    result = {"start_sec": start_stored + start_offset, "end_sec": end_stored + start_offset, "duration": duration}
    save_to_firebase_result(result, anime, ep_target, type_)

    return result


def _filter_hashes_by_time(hashes: list[dict], start_time: float, end_time: float) -> list[dict]:
    """Recorta os hashes que estão dentro do intervalo de tempo e normaliza o tempo para 0."""
    filtered = []
    for h in hashes:
        t = float(h["time"])
        if start_time <= t <= end_time:
            new_hash = h.copy()
            new_hash["time"] = t - start_time
            filtered.append(new_hash)
    return filtered
