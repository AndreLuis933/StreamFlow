import asyncio
from time import perf_counter

from .audio_tools.engine import detect_and_save_segment_and_hashes, find_intro_in_audio
from .baixar_audio import baixar_hls_e_retorna_audio
from .firebase.firebase_consult import consult_hash, consult_intro


async def find_intro_request(anime, ep):
    result = consult_intro(anime, ep)
    if result is not None:
        return result

    ep_num = int(ep)
    ep_formatado = str(ep_num).zfill(3)

    an_hash = consult_hash(anime)
    n_tem_hash = an_hash is None

    urls_video = [
        f"https://cdn-zenitsu-2-gamabunta.b-cdn.net/cf/hls/animes/{anime}/{ep_formatado}.mp4/media-1/stream.m3u8",
    ]
    if n_tem_hash:
        ep_outro = str(ep_num - 1 if ep_num > 1 else ep_num + 1).zfill(3)
        url_video_anterior = (
            f"https://cdn-zenitsu-2-gamabunta.b-cdn.net/cf/hls/animes/{anime}/{ep_outro}.mp4/media-1/stream.m3u8"
        )
        urls_video.append(url_video_anterior)

    tasks = [baixar_hls_e_retorna_audio(url_video, start_sec=0, duration_sec=300) for url_video in urls_video]
    results = await asyncio.gather(*tasks)

    # descobrir se nenhum é nulo
    if any(r is None for r in results):
        print("Falha ao baixar o áudio")
        return None

    if n_tem_hash:
        an_hash = detect_and_save_segment_and_hashes(results[0], results[1], anime)

    return find_intro_in_audio(results[0], an_hash, anime, ep_formatado)


if __name__ == "__main__":
    # detect_and_save_segment_and_hashes("audio/1148.wav", "audio/1149.wav")
    inicio = perf_counter()
    result = asyncio.run(find_intro_request("one-piece", "1149"))
    fim = perf_counter()
    print(fim - inicio)
    "intro.wav"
    # url_video = f"https://cdn-zenitsu-2-gamabunta.b-cdn.net/cf/hls/animes/one-piece/1159.mp4/media-1/stream.m3u8"
    # audio_bytes = asyncio.run(baixar_hls_e_retorna_audio(url_video, start_sec=0, duration_sec=180))
    # print(audio_bytes)
