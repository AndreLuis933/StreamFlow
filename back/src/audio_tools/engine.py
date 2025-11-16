import io

import librosa
import soundfile as sf
from src.config.config import (
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
from src.firebase.firebase_save import save_to_firebase_hash, save_to_firebase_intro

from .fingerprint import fingerprint_audio_array, fingerprint_file
from .matcher import build_hash_map, match_fingerprints_and_estimate_duration, match_hashes_find_timing


def detect_and_save_segment_and_hashes(
    ref_data: bytes,
    query_data: bytes,
    anime,
    eps,
    out_audio_path=None,
):
    ref_hashes, ref_y, ref_sr = fingerprint_file(
        ref_data,
        sr_target=SR_TARGET,
        n_fft=N_FFT,
        hop_length=HOP_LENGTH,
        fan_value=FAN_VALUE,
        peak_neighborhood_size=PEAK_NEIGHBORHOOD_SIZE,
        max_dt_s=MAX_DT_S,
    )
    stored_map = build_hash_map(ref_hashes)

    target_hashes, target_y, target_sr = fingerprint_file(
        query_data,
        sr_target=SR_TARGET,
        n_fft=N_FFT,
        hop_length=HOP_LENGTH,
        fan_value=FAN_VALUE,
        peak_neighborhood_size=PEAK_NEIGHBORHOOD_SIZE,
        max_dt_s=MAX_DT_S,
    )

    match_res = match_fingerprints_and_estimate_duration(
        stored_map,
        target_hashes,
        dt_bucket_ms=DT_BUCKET_MS,
        gap_threshold_s=GAP_THRESHOLD_S,
    )
    if match_res is None:
        print("Nenhuma correspondência encontrada entre os arquivos.")
        return None

    duration = match_res["duration_est_sec"]
    start_stored = match_res["start_stored_sec"]

    if duration < MIN_DURATION_SEC:
        print(f"Duração estimada muito curta do hash ({duration:.2f}s)")
        return None

    start_sample = max(0, int(round(start_stored * ref_sr)))
    end_sample = min(len(ref_y), int(round((start_stored + duration) * ref_sr)))
    segment = ref_y[start_sample:end_sample]

    if segment.size == 0:
        print("Segmento extraído vazio — abortando.")
        return None

    if out_audio_path:
        sf.write(out_audio_path, segment, ref_sr)

    seg_hashes = fingerprint_audio_array(
        segment,
        ref_sr,
        n_fft=N_FFT,
        hop_length=HOP_LENGTH,
        fan_value=FAN_VALUE,
        peak_neighborhood_size=PEAK_NEIGHBORHOOD_SIZE,
        max_dt_s=MAX_DT_S,
    )

    map_h = build_hash_map(seg_hashes)
    save_to_firebase_hash(map_h, anime, eps)
    return map_h


def find_intro_in_audio(audio_data: bytes, stored_map: dict, anime: str, ep: str):
    y, sr = librosa.load(io.BytesIO(audio_data), sr=SR_TARGET, mono=True)
    target_hashes = fingerprint_audio_array(
        y,
        sr,
        n_fft=N_FFT,
        hop_length=HOP_LENGTH,
        fan_value=FAN_VALUE,
        peak_neighborhood_size=PEAK_NEIGHBORHOOD_SIZE,
        max_dt_s=MAX_DT_S,
    )

    result, duration = match_hashes_find_timing(
        stored_map,
        target_hashes,
        dt_bucket_ms=DT_BUCKET_MS,
        gap_threshold_s=GAP_THRESHOLD_S,
    )

    if result is None:
        print("Nenhuma correspondência encontrada.")
        return None

    if duration < MIN_DURATION_SEC:
        print(f"Duração estimada da comparaçao do hash com o atual muito curta ({duration:.2f}s)")
        return None

    save_to_firebase_intro(result, anime, ep)

    return result
