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
from firebase.firebase_save import save_to_firebase_result

from .fingerprint import fingerprint_audio_array
from .matcher import match_hashes_find_timing

if TYPE_CHECKING:
    import numpy as np

def find_pattern_in_audio(
    audio_bytes: np.ndarray,
    stored_hash_map: dict,
    serie: str,
    ep: int,
    type_: str,
    start_offset: float,
) -> dict[str, float] | None:
    """Busca um padrão de hashes (stored_hash_map) dentro de um arquivo de áudio (bytes)."""
    # 2. Gerar Fingerprint do Áudio Alvo
    target_hashes = fingerprint_audio_array(
        audio_bytes,
        SR_TARGET,
        n_fft=N_FFT,
        hop_length=HOP_LENGTH,
        fan_value=FAN_VALUE,
        peak_neighborhood_size=PEAK_NEIGHBORHOOD_SIZE,
        max_dt_s=MAX_DT_S,
    )

    # 3. Encontrar Correspondência
    match_result = match_hashes_find_timing(
        stored_hash_map,
        target_hashes,
        dt_bucket_ms=DT_BUCKET_MS,
        gap_threshold_s=GAP_THRESHOLD_S,
    )

    if match_result is None:
        print("Nenhuma correspondência encontrada.")
        return None

    if match_result["duration"] < MIN_DURATION_SEC:
        print(f"Duração do match muito curta ({match_result['duration']:.2f}s)")
        return None

    # 4. Formatar e Salvar Resultado
    final_result = {key: value + start_offset for key, value in match_result.items()}

    save_to_firebase_result(final_result, serie, ep, type_)

    return final_result
