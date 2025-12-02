import asyncio
from urllib.error import HTTPError, URLError

import httpx
import m3u8
from httpx_retries import Retry, RetryTransport


async def baixar_segmento(client, i, seg_url, headers):
    response = await client.get(seg_url, headers=headers)
    data = response.content
    return (i, data)


async def baixar_hls_para_buffer(url_m3u8, type_, duration_sec=None):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Referer": "https://www.api-vidios.net/",
    }
    try:
        playlist = m3u8.load(url_m3u8, headers=headers)
    except (HTTPError, URLError):
        return None, None

    if playlist.playlists:
        variant_url = playlist.playlists[0].absolute_uri
        playlist = m3u8.load(variant_url, headers=headers)

    if not playlist.segments:
        print("Nenhum segmento encontrado!")
        return None, None

    segmentos_data = {}

    semaphore = asyncio.Semaphore(10)

    # Função interna para usar o semáforo global
    async def download_with_semaphore(client, i, seg):
        async with semaphore:
            return await baixar_segmento(client, i, seg.absolute_uri, headers)

    segments_to_download = []
    init_duration = 0

    if type_ == "intro":
        # Pegar os primeiros segmentos
        accumulated_duration = 0
        for i, seg in enumerate(playlist.segments):
            accumulated_duration += seg.duration
            segments_to_download.append((i, seg))

            if duration_sec and accumulated_duration >= duration_sec:
                break
    else:
        # Pegar os últimos segmentos
        total_duration = sum(seg.duration for seg in playlist.segments)
        init_duration = total_duration - duration_sec if duration_sec else 0

        accumulated_duration = 0

        for i in range(len(playlist.segments) - 1, -1, -1):
            seg = playlist.segments[i]
            accumulated_duration += seg.duration
            segments_to_download.insert(0, (i, seg))

            if duration_sec and accumulated_duration >= duration_sec:
                break

    retry = Retry(total=10, backoff_factor=0.5)
    transport = RetryTransport(retry=retry)

    async with httpx.AsyncClient(
        follow_redirects=True,
        timeout=httpx.Timeout(20.0, read=10.0, connect=2.0),
        limits=httpx.Limits(max_keepalive_connections=20, max_connections=10),
        transport=transport,
    ) as client:
        tasks = [download_with_semaphore(client, i, seg) for i, seg in segments_to_download]
        results = await asyncio.gather(*tasks)
        segmentos_data = dict(results)

    # Concatenar todos os segmentos em memória
    buffer_completo = b"".join(data for i, data in sorted(segmentos_data.items()))

    return buffer_completo, init_duration
