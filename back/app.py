import urllib.parse
from typing import Annotated

import httpx
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse, StreamingResponse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FIXED_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Referer": "https://www.api-vidios.net/",
}


def build_m3u8_url(nome: str, ep: str) -> str:
    ep_norm = ep.zfill(3)
    return f"https://cdn-zenitsu-2-gamabunta.b-cdn.net/cf/hls/animes/{nome}/{ep_norm}.mp4/media-1/stream.m3u8"


@app.get("/m3u8")
async def proxy_m3u8(nome: Annotated[str, Query(...)], ep: Annotated[str, Query(...)]):
    """Proxy da playlist .m3u8.
    - Baixa a m3u8 da origem com headers fixos
    - Reescreve as URLs de segmentos para passar por /seg?u=...
    - Retorna m3u8 com content-type correto.
    """
    src_url = build_m3u8_url(nome, ep)
    async with httpx.AsyncClient(follow_redirects=True, timeout=30) as client:
        r = await client.get(src_url, headers=FIXED_HEADERS)
        if r.status_code != 200:
            raise HTTPException(status_code=502, detail=f"Falha ao obter m3u8 ({r.status_code})")
        text = r.text

    base = urllib.parse.urljoin(src_url, ".")

    out_lines = []
    for line in text.splitlines():
        line_stripped = line.strip()
        if not line_stripped or line_stripped.startswith("#"):
            out_lines.append(line)
            continue

        abs_url = urllib.parse.urljoin(base, line_stripped)
        proxied = f"/seg?u={urllib.parse.quote(abs_url, safe='')}"
        out_lines.append(proxied)

    rewritten = "\n".join(out_lines) + ("\n" if not out_lines or not out_lines[-1].endswith("\n") else "")

    return PlainTextResponse(
        rewritten,
        media_type="application/vnd.apple.mpegurl",
        headers={"Cache-Control": "no-store"},
    )


@app.get("/seg")
async def proxy_segment(u: Annotated[str, Query(...)]):
    """Proxy de segmentos (.ts/.m4s/.aac...):
    - Busca o segmento com headers fixos
    - Faz stream dos bytes para o cliente.
    """
    url = urllib.parse.unquote(u)

    async def gen():
        async with (
            httpx.AsyncClient(follow_redirects=True, timeout=60) as client,
            client.stream("GET", url, headers=FIXED_HEADERS) as r,
        ):
            if r.status_code != 200:
                raise HTTPException(status_code=502, detail=f"Falha ao obter segmento ({r.status_code})")
            async for chunk in r.aiter_bytes(64 * 1024):
                yield chunk

    return StreamingResponse(gen(), media_type="video/MP2T", headers={"Cache-Control": "no-store"})


@app.get("/data")
async def search(q: Annotated[str, Query(...)]):
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.get(f"https://api-search.api-vidios.net/data?q={q}", headers=FIXED_HEADERS)
    return r.json()


@app.get("/animes")
async def animes(slug: Annotated[str, Query(...)], page: Annotated[str, Query(...)]):
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.get(
            f"https://apiv3-prd.api-vidios.net/animes/{slug}/episodes?page={page}&order=desc",
            headers=FIXED_HEADERS,
        )
    return r.json()


@app.get("/detalhes")
async def detalhes(slug: Annotated[str, Query(...)]):
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.get(
            f"https://www.api-vidios.net/_next/data/RWySOXkJe1_j6zQD6H8T_/a/{slug}.json?anime={slug}",
            headers=FIXED_HEADERS,
        )
    return r.json()
