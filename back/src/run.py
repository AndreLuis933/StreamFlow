import gc

from audio_tools.audio_finder import find_pattern_in_audio
from audio_tools.segment_extractor import extract_and_save_common_segment
from config.loggin import measure_time
from firebase.firebase_consult import buscar_hashes_proximos, consult_seguement
from firebase.firebase_save import atualizar_hash_uso
from network.baixar_video import baixar_hls_para_buffer
from utils.descomprimir import descomprimir_fingerprint
from utils.extrair_audio import converter_buffer_to_numpy


async def audio_hash(ep_num, ep_formatado, anime, audio_atual, out_audio_path, type_):
    # 1ª tentativa: anterior se ep > 1, senão próximo
    if ep_num > 1:
        ep_primeira = ep_num - 1  # anterior
        ep_segunda = ep_num + 1  # fallback: próximo
    else:
        ep_primeira = ep_num + 1  # se é 1, só tem próximo
        ep_segunda = None  # não faz sentido tentar ep 0

    # ==== PRIMEIRA TENTATIVA ====
    ep_primeira_fmt = str(ep_primeira).zfill(3)
    url_primeira = (
        f"https://cdn-zenitsu-2-gamabunta.b-cdn.net/cf/hls/animes/{anime}/{ep_primeira_fmt}.mp4/media-1/stream.m3u8"
    )

    # Log: Baixar Audio 1
    with measure_time(f"Baixar Vidio Ref (Ep {ep_primeira})"):
        buffer_ts, start_duration = await baixar_hls_para_buffer(url_primeira, type_, duration_sec=420)
    with measure_time(f"Converter Audio Ref (Ep {ep_primeira})"):
        if buffer_ts:
            # 2. Converte o buffer para áudio WAV
            audio_primeira = converter_buffer_to_numpy(buffer_ts)
            del buffer_ts
            gc.collect()

    if audio_primeira is None:
        print("Falha ao baixar o áudio de referência (primeira tentativa)")
    else:
        # Log: Detectar e Hash 1
        with measure_time("Gerar Hash (Tentativa 1)"):
            seguement = extract_and_save_common_segment(
                audio_atual,
                audio_primeira,
                anime,
                ep_formatado,
                type_,
                start_duration,
                out_audio_path,
            )

        if seguement is not None:
            return seguement

    # ==== SEGUNDA TENTATIVA ====
    if ep_segunda is None:
        print("Não há episódio alternativo para tentar gerar hash.")
        return None

    ep_segunda_fmt = str(ep_segunda).zfill(3)
    url_segunda = (
        f"https://cdn-zenitsu-2-gamabunta.b-cdn.net/cf/hls/animes/{anime}/{ep_segunda_fmt}.mp4/media-1/stream.m3u8"
    )

    # Log: Baixar Audio 2
    with measure_time(f"Baixar Vidio Ref (Ep {ep_segunda})"):
        buffer_ts, start_duration = await baixar_hls_para_buffer(url_segunda, type_, duration_sec=420)
    with measure_time(f"Converter Audio Ref (Ep {ep_segunda})"):
        if buffer_ts:
            # 2. Converte o buffer para áudio WAV
            audio_segunda = converter_buffer_to_numpy(buffer_ts)
            del buffer_ts
            gc.collect()

    if audio_segunda is None:
        print("Falha ao baixar áudio alternativo (segunda tentativa)")
        return None

    # Log: Detectar e Hash 2
    with measure_time("Gerar Hash (Tentativa 2)"):
        seguement = extract_and_save_common_segment(
            audio_atual,
            audio_segunda,
            anime,
            ep_formatado,
            type_,
            start_duration,
            out_audio_path,
        )

    if seguement is None:
        print("Não foi possível gerar hash válido com nenhuma das opções. Não há como validar.")
        return None

    return seguement


async def find_seguement_request(anime, ep, type_, out_audio_path=None):
    result = consult_seguement(anime, ep, type_)
    if result is not None:
        return result

    ep_num = int(ep)
    ep_formatado = str(ep_num).zfill(3)

    candidatos = buscar_hashes_proximos(anime, ep_num, type_)

    url_atual = (
        f"https://cdn-zenitsu-2-gamabunta.b-cdn.net/cf/hls/animes/{anime}/{ep_formatado}.mp4/media-1/stream.m3u8"
    )

    # Log: Baixar Audio Atual
    with measure_time(f"Baixar vidio Atual (Ep {ep})"):
        buffer_ts, init_duration = await baixar_hls_para_buffer(url_atual, type_, duration_sec=420)
    with measure_time(f"Converter Audio Atual (Ep {ep})"):
        if buffer_ts:
            # 2. Converte o buffer para áudio WAV
            audio_atual = converter_buffer_to_numpy(buffer_ts)
            del buffer_ts
            gc.collect()

    if audio_atual is None:
        print("Falha ao baixar o áudio atual")
        return None

    if candidatos:
        for i, candidato in enumerate(candidatos):
            fingerprint_salvo = descomprimir_fingerprint(candidato["fingerprint_data"])

            # Log: Comparar com candidato
            with measure_time(f"Comparar Candidato {i + 1}"):
                intro = find_pattern_in_audio(
                    audio_atual,
                    fingerprint_salvo,
                    anime,
                    ep_formatado,
                    type_,
                    init_duration,
                )

            if intro is not None:
                atualizar_hash_uso(anime, candidato["doc_id"], ep_num)
                return intro

        # Se falhar nos candidatos, vai para o hash completo
        return await audio_hash(ep_num, ep_formatado, anime, audio_atual, out_audio_path, type_)

    return await audio_hash(ep_num, ep_formatado, anime, audio_atual, out_audio_path, type_)
