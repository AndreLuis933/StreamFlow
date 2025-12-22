import asyncio

import boto3
import m3u8

s3_client = boto3.client("s3")


async def baixar_segmento_s3(bucket: str, seg_key: str, index: int):
    loop = asyncio.get_event_loop()
    response = await loop.run_in_executor(None, lambda: s3_client.get_object(Bucket=bucket, Key=seg_key))
    data = response["Body"].read()
    return (index, data)


async def baixar_hls_do_s3(bucket: str, m3u8_key: str, type_: str, duration_sec: int = None):
    try:
        response = s3_client.get_object(Bucket=bucket, Key=m3u8_key)
        m3u8_content = response["Body"].read().decode("utf-8")
    except Exception as e:
        print(f"Erro ao buscar m3u8 do S3: {e}")
        return None, None

    playlist = m3u8.loads(m3u8_content)

    if playlist.playlists:
        variant_uri = playlist.playlists[0].uri
        base_path = "/".join(m3u8_key.split("/")[:-1])
        variant_key = f"{base_path}/{variant_uri}"

        try:
            response = s3_client.get_object(Bucket=bucket, Key=variant_key)
            variant_content = response["Body"].read().decode("utf-8")
            playlist = m3u8.loads(variant_content)
        except Exception as e:
            print(f"Erro ao buscar variant playlist: {e}")
            return None, None

    if not playlist.segments:
        print("Nenhum segmento encontrado!")
        return None, None

    base_path = "/".join(m3u8_key.split("/")[:-1])

    segments_to_download = []
    init_duration = 0

    if type_ == "intro":
        accumulated_duration = 0
        for i, seg in enumerate(playlist.segments):
            accumulated_duration += seg.duration
            seg_key = f"{base_path}/{seg.uri}"
            segments_to_download.append((i, seg_key))

            if duration_sec and accumulated_duration >= duration_sec:
                break
    else:
        total_duration = sum(seg.duration for seg in playlist.segments)
        init_duration = total_duration - duration_sec if duration_sec else 0

        accumulated_duration = 0

        for i in range(len(playlist.segments) - 1, -1, -1):
            seg = playlist.segments[i]
            accumulated_duration += seg.duration
            seg_key = f"{base_path}/{seg.uri}"
            segments_to_download.insert(0, (i, seg_key))

            if duration_sec and accumulated_duration >= duration_sec:
                break

    semaphore = asyncio.Semaphore(10)

    async def download_with_semaphore(index, seg_key):
        async with semaphore:
            return await baixar_segmento_s3(bucket, seg_key, index)

    tasks = [download_with_semaphore(i, seg_key) for i, seg_key in segments_to_download]
    results = await asyncio.gather(*tasks)
    segmentos_data = dict(results)

    buffer_completo = b"".join(data for i, data in sorted(segmentos_data.items()))

    return buffer_completo, init_duration
