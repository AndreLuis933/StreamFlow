import asyncio

import aiohttp
import m3u8


async def baixar_segmento(session, i, seg_url, headers):
    try:
        async with session.get(seg_url, headers=headers, timeout=30) as response:
            data = await response.read()
            return (i, data)
    except Exception as e:
        print(f"Erro no segmento {i}: {e}")
        return (i, None)


async def baixar_hls(url_m3u8, saida, max_concurrent=16):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Referer": "https://www.api-vidios.net/",
    }

    # Parsear playlist (síncrono)
    playlist = m3u8.load(url_m3u8, headers=headers)

    if playlist.playlists:
        variant_url = playlist.playlists[0].absolute_uri
        playlist = m3u8.load(variant_url, headers=headers)

    if not playlist.segments:
        print("Nenhum segmento encontrado!")
        return

    # Download assíncrono
    segmentos_data = {}
    semaphore = asyncio.Semaphore(max_concurrent)

    async def download_with_semaphore(session, i, seg):
        async with semaphore:
            result = await baixar_segmento(session, i, seg.absolute_uri, headers)
            print(f"Baixado: {i + 1}/{len(playlist.segments)}")
            return result

    async with aiohttp.ClientSession() as session:
        tasks = [download_with_semaphore(session, i, seg) for i, seg in enumerate(playlist.segments)]
        results = await asyncio.gather(*tasks)

        for i, data in results:
            if data:
                segmentos_data[i] = data

    # Salvar na ordem
    print("Salvando arquivo...")
    with open(saida, "wb") as f:
        for i in range(len(playlist.segments)):
            if i in segmentos_data:
                f.write(segmentos_data[i])

    print(f"Download completo: {saida}")


if __name__ == "__main__":
    url_video = "https://cdn-zenitsu-2-gamabunta.b-cdn.net/cf/hls/animes/boku-no-hero-academia-final/003.mp4/media-1/stream.m3u8"
    asyncio.run(baixar_hls(url_video, "meu_video.mp4", max_concurrent=16))
