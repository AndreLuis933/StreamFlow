import gc
import os

import boto3
from audio_tools.audio_finder import find_pattern_in_audio
from audio_tools.segment_extractor import extract_and_save_common_segment
from config.config import DURATION_SECS
from config.loggin import measure_time
from firebase.firebase_consult import buscar_hashes_proximos, consult_segment
from firebase.firebase_save import atualizar_hash_uso
from network.baixar_video import baixar_hls_do_s3
from utils.descomprimir import descomprimir_fingerprint
from utils.extrair_audio import converter_buffer_to_numpy

s3_client = boto3.client("s3")
S3_BUCKET = os.environ.get("VIDEOS_BUCKET", "aws-videos-poc")


def build_s3_m3u8_key(title: str, ep: int) -> str:
    ep_norm = str(ep).zfill(2)
    return f"series/{title}/videos/ep-{ep_norm}/master.m3u8"


async def audio_hash(ep_num, ep_formatado, title, audio_atual, out_audio_path, type_):
    if ep_num > 1:
        ep_primeira = ep_num - 1
        ep_segunda = ep_num + 1
    else:
        ep_primeira = ep_num + 1
        ep_segunda = None

    m3u8_key_primeira = build_s3_m3u8_key(title, ep_primeira)

    with measure_time(f"Baixar Video Ref (Ep {ep_primeira})"):
        buffer_ts, start_duration = await baixar_hls_do_s3(
            S3_BUCKET,
            m3u8_key_primeira,
            type_,
            duration_sec=DURATION_SECS,
        )

    with measure_time(f"Converter Audio Ref (Ep {ep_primeira})"):
        if buffer_ts:
            audio_primeira = converter_buffer_to_numpy(buffer_ts)
            del buffer_ts
            gc.collect()

    if audio_primeira is None:
        print("Falha ao baixar o audio de referencia (primeira tentativa)")
    else:
        with measure_time("Gerar Hash (Tentativa 1)"):
            segment = extract_and_save_common_segment(
                audio_atual,
                audio_primeira,
                title,
                ep_num,
                type_,
                start_duration,
                out_audio_path,
            )

        if segment is not None:
            return segment

    if ep_segunda is None:
        print("Nao ha episodio alternativo para tentar gerar hash.")
        return None

    m3u8_key_segunda = build_s3_m3u8_key(title, ep_segunda)

    with measure_time(f"Baixar Video Ref (Ep {ep_segunda})"):
        buffer_ts, start_duration = await baixar_hls_do_s3(
            S3_BUCKET,
            m3u8_key_segunda,
            type_,
            duration_sec=DURATION_SECS,
        )

    with measure_time(f"Converter Audio Ref (Ep {ep_segunda})"):
        if buffer_ts:
            audio_segunda = converter_buffer_to_numpy(buffer_ts)
            del buffer_ts
            gc.collect()

    if audio_segunda is None:
        print("Falha ao baixar audio alternativo (segunda tentativa)")
        return None

    with measure_time("Gerar Hash (Tentativa 2)"):
        segment = extract_and_save_common_segment(
            audio_atual,
            audio_segunda,
            title,
            ep_num,
            type_,
            start_duration,
            out_audio_path,
        )

    if segment is None:
        print("Nao foi possivel gerar hash valido com nenhuma das opcoes.")
        return None

    return segment


async def find_segment_request(title, ep_num, type_, out_audio_path=None):
    result = consult_segment(title, ep_num, type_)
    if result is not None:
        return result

    ep_formatado = str(ep_num).zfill(2)

    candidatos = buscar_hashes_proximos(title, ep_num, type_)

    m3u8_key_atual = build_s3_m3u8_key(title, ep_num)

    with measure_time(f"Baixar Video Atual (Ep {ep_num})"):
        buffer_ts, init_duration = await baixar_hls_do_s3(S3_BUCKET, m3u8_key_atual, type_, duration_sec=DURATION_SECS)

    with measure_time(f"Converter Audio Atual (Ep {ep_num})"):
        if buffer_ts:
            audio_atual = converter_buffer_to_numpy(buffer_ts)
            del buffer_ts
            gc.collect()

    if audio_atual is None:
        print("Falha ao baixar o audio atual")
        return None

    if candidatos:
        for i, candidato in enumerate(candidatos):
            fingerprint_salvo = descomprimir_fingerprint(candidato["fingerprint_data"])

            with measure_time(f"Comparar Candidato {i + 1}"):
                intro = find_pattern_in_audio(
                    audio_atual,
                    fingerprint_salvo,
                    title,
                    ep_num,
                    type_,
                    init_duration,
                )

            if intro is not None:
                atualizar_hash_uso(title, candidato["doc_id"], ep_num)
                return intro

        return await audio_hash(ep_num, ep_formatado, title, audio_atual, out_audio_path, type_)

    return await audio_hash(ep_num, ep_formatado, title, audio_atual, out_audio_path, type_)
