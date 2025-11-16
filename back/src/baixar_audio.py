import asyncio
from urllib.error import HTTPError, URLError

import aiohttp
import m3u8

from .config.config import SR_TARGET


async def baixar_segmento(session, i, seg_url, headers):
    try:
        async with session.get(seg_url, headers=headers, timeout=30) as response:
            data = await response.read()
            return (i, data)
    except (HTTPError, URLError) as e:
        print(f"Erro no segmento {i}: {e}")
        return (i, None)


semaphore = asyncio.Semaphore(16)


async def baixar_hls_e_retorna_audio(url_m3u8, type_, start_sec=None, duration_sec=None):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Referer": "https://www.api-vidios.net/",
    }
    try:
        playlist = m3u8.load(url_m3u8, headers=headers)
    except (HTTPError, URLError):
        return None

    if playlist.playlists:
        variant_url = playlist.playlists[0].absolute_uri
        playlist = m3u8.load(variant_url, headers=headers)

    if not playlist.segments:
        print("Nenhum segmento encontrado!")
        return None

    segmentos_data = {}

    async def download_with_semaphore(session, i, seg):
        async with semaphore:
            return await baixar_segmento(session, i, seg.absolute_uri, headers)

    segments_to_download = []

    if type_ == "intro":
        # Pegar os primeiros segmentos
        init_duration = 0
        accumulated_duration = 0
        for i, seg in enumerate(playlist.segments):
            accumulated_duration += seg.duration
            segments_to_download.append((i, seg))

            if accumulated_duration >= duration_sec:
                break
    else:
        # Pegar os últimos segmentos
        total_duration = sum(seg.duration for seg in playlist.segments)
        init_duration = total_duration - duration_sec
        accumulated_duration = 0

        for i in range(len(playlist.segments) - 1, -1, -1):
            seg = playlist.segments[i]
            accumulated_duration += seg.duration
            segments_to_download.insert(0, (i, seg))

            if accumulated_duration >= duration_sec:
                break

    async with aiohttp.ClientSession() as session:
        tasks = [download_with_semaphore(session, i, seg) for i, seg in segments_to_download]
        results = await asyncio.gather(*tasks)
        segmentos_data = dict(results)

    # Concatenar todos os segmentos em memória
    buffer_completo = b"".join(segmentos_data[i] for i in sorted(segmentos_data.keys()))

    cmd = [
        "ffmpeg",
        "-f",
        "mpegts",
        "-i",
        "pipe:0",
        "-vn",
    ]

    if start_sec is not None:
        cmd += ["-ss", str(start_sec)]

    if duration_sec is not None:
        cmd += ["-t", str(duration_sec)]

    cmd += [
        "-acodec",
        "pcm_s16le",
        "-ar",
        str(SR_TARGET),
        "-ac",
        "1",
        "-f",
        "wav",
        "pipe:1",
    ]
    proc = await asyncio.create_subprocess_exec(
        *cmd,
        stdin=asyncio.subprocess.PIPE,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.DEVNULL,
    )

    stdout_data, _ = await proc.communicate(input=buffer_completo)

    if proc.returncode == 0:
        return stdout_data, init_duration

    print("❌ Erro ao processar com FFmpeg")
    return None
