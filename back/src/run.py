import asyncio
from time import perf_counter

from .audio_tools.engine import detect_and_save_segment_and_hashes, find_intro_in_audio
from .baixar_audio import baixar_hls_e_retorna_audio
from .firebase.firebase_consult import buscar_hashes_proximos, consult_seguement
from .firebase.firebase_save import atualizar_hash_uso
from .utils.descomprimir import descomprimir_fingerprint

semaphore = asyncio.Semaphore(1)

async def audio_hash(ep_num, ep_formatado, anime, audio_atual, out_audio_path, type_):
    # 1ª tentativa: anterior se ep > 1, senão próximo
    if ep_num > 1:
        ep_primeira = ep_num - 1  # anterior
        ep_segunda = ep_num + 1  # fallback: próximo
    else:
        ep_primeira = ep_num + 1  # se é 1, só tem próximo
        ep_segunda = None  # não faz sentido tentar ep 0

    # ==== PRIMEIRA TENTATIVA (anterior se ep > 1, senão próximo) ====
    ep_primeira_fmt = str(ep_primeira).zfill(3)
    url_primeira = (
        f"https://cdn-zenitsu-2-gamabunta.b-cdn.net/cf/hls/animes/{anime}/{ep_primeira_fmt}.mp4/media-1/stream.m3u8"
    )

    audio_primeira, start_duration = await baixar_hls_e_retorna_audio(
        url_primeira, type_, start_sec=0, duration_sec=420
    )

    if audio_primeira is None:
        print("Falha ao baixar o áudio de referência (primeira tentativa)")
    else:
        novo_hash = await asyncio.to_thread(detect_and_save_segment_and_hashes,
            audio_atual, audio_primeira, anime, ep_formatado, type_, out_audio_path
        )
        if novo_hash is not None:
            # Hash válido - devolve resultado
            return await asyncio.to_thread(find_intro_in_audio,audio_atual, novo_hash, anime, ep_formatado, type_, start_duration)

    # ==== SEGUNDA TENTATIVA (fallback: próximo se a primeira foi anterior, ou vice-versa) ====
    if ep_segunda is None:
        # Não há segunda opção válida (ex: ep 1 não tem anterior)
        print("Não há episódio alternativo para tentar gerar hash.")
        return None

    ep_segunda_fmt = str(ep_segunda).zfill(3)
    url_segunda = (
        f"https://cdn-zenitsu-2-gamabunta.b-cdn.net/cf/hls/animes/{anime}/{ep_segunda_fmt}.mp4/media-1/stream.m3u8"
    )

    audio_segunda, start_duration = await baixar_hls_e_retorna_audio(url_segunda, type_, start_sec=0, duration_sec=420)

    if audio_segunda is None:
        print("Falha ao baixar áudio alternativo (segunda tentativa)")
        return None

    novo_hash = await asyncio.to_thread(detect_and_save_segment_and_hashes,
        audio_atual, audio_segunda, anime, ep_formatado, type_, out_audio_path
    )

    if novo_hash is None:
        # Não tem como validar
        print("Não foi possível gerar hash válido com nenhuma das opções. Não há como validar.")
        return None

    # Hash válido - devolve resultado
    return await asyncio.to_thread(find_intro_in_audio,audio_atual, novo_hash, anime, ep_formatado, type_, start_duration)


async def find_seguement_request(anime, ep, type_, out_audio_path=None):
    async with semaphore:
        print(type_)
        result = consult_seguement(anime, ep, type_)
        if result is not None:
            return result

        ep_num = int(ep)
        ep_formatado = str(ep_num).zfill(3)

        candidatos = buscar_hashes_proximos(anime, ep_num, type_)

        url_atual = (
            f"https://cdn-zenitsu-2-gamabunta.b-cdn.net/cf/hls/animes/{anime}/{ep_formatado}.mp4/media-1/stream.m3u8"
        )
        audio_atual, start_duration = await baixar_hls_e_retorna_audio(url_atual, type_, start_sec=0, duration_sec=420)
        if audio_atual is None:
            print("Falha ao baixar o áudio atual")
            return None
        if candidatos:
            for candidato in candidatos:
                fingerprint_salvo = descomprimir_fingerprint(candidato["fingerprint_data"])
                intro = await asyncio.to_thread(find_intro_in_audio,
                    audio_atual, fingerprint_salvo, anime, ep_formatado, type_, start_duration
                )
                if intro is not None:
                    atualizar_hash_uso(anime, candidato["doc_id"], ep_num)
                    return intro
            return await audio_hash(ep_num, ep_formatado, anime, audio_atual, out_audio_path, type_)

        return await audio_hash(ep_num, ep_formatado, anime, audio_atual, out_audio_path, type_)


if __name__ == "__main__":
    # detect_and_save_segment_and_hashes("audio/1148.wav", "audio/1149.wav")
    inicio = perf_counter()
    result = asyncio.run(find_seguement_request("one-piece", "1149", "intro.wav"))
    fim = perf_counter()
    print(fim - inicio)
    # url_video = f"https://cdn-zenitsu-2-gamabunta.b-cdn.net/cf/hls/animes/one-piece/1159.mp4/media-1/stream.m3u8"
    # audio_bytes = asyncio.run(baixar_hls_e_retorna_audio(url_video, start_sec=0, duration_sec=180))
    # print(audio_bytes)
