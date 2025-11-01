import asyncio
from pathlib import Path
from typing import Optional

import yt_dlp
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, StreamingResponse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

VIDEO_PATH = Path(__file__).parent / "videos"
CHUNK_SIZE = 1024 * 1024  # 1 MB


download_status = {"is_downloading": False, "progress": 0}


async def baixar_video_m3u8(nome: str, ep: str):
    """Baixa vídeo m3u8 usando yt-dlp."""
    download_status["is_downloading"] = True
    download_status["progress"] = 0
    url = f"https://cdn-zenitsu-2-gamabunta.b-cdn.net/cf/hls/animes/{nome}/{ep.zfill(3)}.mp4/media-1/stream.m3u8"

    ydl_opts = {
        "outtmpl": str(VIDEO_PATH / f"{nome}_{ep}.mp4"),
        "concurrent_fragment_downloads": 16,
        "overwrites": False,
        "http_headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Referer": "https://www.api-vidios.net/",
        },
        "progress_hooks": [lambda d: download_status.update({"progress": d.get("downloaded_bytes", 0)})],
    }

    try:
        # Executa yt-dlp em thread separada para não bloquear
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, lambda: yt_dlp.YoutubeDL(ydl_opts).download([url]))
        download_status["is_downloading"] = False
        return True
    except Exception as e:
        download_status["is_downloading"] = False
        raise HTTPException(status_code=500, detail=f"Erro ao baixar: {str(e)}")


def ranged_reader(file_path: Path, start: int, end: int):
    """Generator que lê bytes do arquivo no intervalo [start, end]"""
    with open(file_path, "rb") as f:
        f.seek(start)
        bytes_to_read = end - start + 1
        while bytes_to_read > 0:
            chunk = f.read(min(CHUNK_SIZE, bytes_to_read))
            if not chunk:
                break
            bytes_to_read -= len(chunk)
            yield chunk


@app.get("/download")
async def iniciar_download(nome: str, ep: str):
    """Inicia o download do vídeo m3u8."""
    if download_status["is_downloading"]:
        raise HTTPException(status_code=409, detail="Download já em andamento")
    saida = VIDEO_PATH / f"{nome}_{ep}.mp4"
    if saida.exists():
        raise HTTPException(status_code=409, detail="Já existe")

    asyncio.create_task(baixar_video_m3u8(nome, ep))
    return {"message": "Download iniciado", "status": "downloading"}


@app.get("/status")
async def status(nome: str, ep: str):
    saida = VIDEO_PATH / f"{nome}_{ep}.mp4"
    headers = {"Cache-Control": "no-store"}
    if saida.exists():
        return Response(status_code=200, headers=headers)
    return Response(status_code=404, headers=headers)


@app.get("/video")
async def stream_video(nome: str, ep: str, range: Optional[str] = Header(None)):
    saida = VIDEO_PATH / f"{nome}_{ep}.mp4"
    if not saida.exists():
        raise HTTPException(status_code=404, detail="Vídeo não encontrado. Inicie o download primeiro.")
    if not nome and not ep:
        return Response(status_code=404)

    file_size = saida.stat().st_size

    # Parse do Range header (ou usa 0 até o final se não vier)
    if range:
        try:
            range = range.strip().lower()
            assert range.startswith("bytes=")
            parts = range.replace("bytes=", "").split("-")
            start = int(parts[0]) if parts[0] else 0
            end = int(parts[1]) if len(parts) > 1 and parts[1] else file_size - 1
        except Exception:
            # Range inválido, retorna erro
            return Response(status_code=416)  # ← Mudança aqui
    else:
        # Sem Range: trata como se pedisse tudo (0 até o final)
        start = 0
        end = file_size - 1

    # Valida range
    if start >= file_size or end >= file_size or start > end:
        return Response(status_code=416)  # ← Mudança aqui

    content_length = end - start + 1

    # SEMPRE retorna 206 Partial Content
    return StreamingResponse(
        ranged_reader(saida, start, end),
        media_type="video/mp4",
        status_code=206,
        headers={
            "Content-Range": f"bytes {start}-{end}/{file_size}",
            "Content-Length": str(content_length),
            "Accept-Ranges": "bytes",
        },
    )
