import json
import re
import urllib.parse
from contextlib import asynccontextmanager
from typing import Annotated

import httpx
from fastapi import FastAPI, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse, StreamingResponse
from src.run import find_intro_request


@asynccontextmanager
async def lifespan(app: FastAPI):
    global client
    client = httpx.AsyncClient(
        follow_redirects=True, timeout=60, limits=httpx.Limits(max_keepalive_connections=20, max_connections=50)
    )
    yield
    await client.aclose()


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = None


FIXED_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Referer": "https://www.api-vidios.net/",
}

_build_id_cache = None


def build_m3u8_url(nome: str, ep: str) -> str:
    ep_norm = ep.zfill(3)
    return f"https://cdn-zenitsu-2-gamabunta.b-cdn.net/cf/hls/animes/{nome}/{ep_norm}.mp4/media-1/stream.m3u8"


async def get_build_id(force_refresh: bool = False) -> str:
    """Obtém o buildId (com cache)."""
    global _build_id_cache

    if _build_id_cache and not force_refresh:
        return _build_id_cache

    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.get("https://www.api-vidios.net/", headers=FIXED_HEADERS)
        match = re.search(r"\/_next\/static\/([A-Za-z0-9_-]+)\/_buildManifest\.js", r.text)

        if match:
            _build_id_cache = match.group(1)
            return _build_id_cache

        raise Exception("Não foi possível encontrar o buildId")


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
        proxied = f"http://localhost:8000/seg?u={urllib.parse.quote(abs_url, safe='')}"
        out_lines.append(proxied)

    rewritten = "\n".join(out_lines) + ("\n" if not out_lines or not out_lines[-1].endswith("\n") else "")

    return PlainTextResponse(
        rewritten,
        media_type="application/vnd.apple.mpegurl",
        headers={"Cache-Control": "public, max-age=36000"},
    )


@app.get("/seg")
async def proxy_segment(u: Annotated[str, Query(...)]):
    url = urllib.parse.unquote(u)

    async def gen():
        async with client.stream("GET", url, headers=FIXED_HEADERS) as r:
            if r.status_code != 200:
                raise HTTPException(status_code=502, detail=f"Falha ao obter segmento ({r.status_code})")
            async for chunk in r.aiter_bytes(128 * 1024):
                yield chunk

    return StreamingResponse(
        gen(),
        media_type="video/MP2T",
        headers={"Cache-Control": "public, max-age=300"},
    )

@app.get("/intro")
async def get_intro(anime: Annotated[str, Query(...)],ep: Annotated[str, Query(...)]):
    return await find_intro_request(anime, ep)


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
    return Response(
        json.dumps(r.json()),
        media_type="application/json",
        headers={"Cache-Control": "public, max-age=36000"},
    )


@app.get("/detalhes/anime")
async def detalhes_anime(slug: Annotated[str, Query(...)]):
    """Detalhes de um anime específico."""
    return await fetch_with_build_id(path=f"/a/{slug}.json", query_param=f"anime={slug}")


@app.get("/detalhes/episodio")
async def detalhes_episodio(slug: Annotated[str, Query(...)]):
    """Detalhes de um episódio específico."""
    return await fetch_with_build_id(path=f"/e/{slug}.json", query_param=f"episode={slug}")


async def fetch_with_build_id(path: str, query_param: str):
    """Função auxiliar para fazer requisições com buildId e retry automático."""
    build_id = await get_build_id()

    async with httpx.AsyncClient(timeout=30) as client:
        url = f"https://www.api-vidios.net/_next/data/{build_id}{path}?{query_param}"
        r = await client.get(url, headers=FIXED_HEADERS)

        # Se der 404, tenta atualizar o buildId e refaz a requisição
        if r.status_code == 404:
            build_id = await get_build_id(force_refresh=True)
            url = f"https://www.api-vidios.net/_next/data/{build_id}{path}?{query_param}"
            r = await client.get(url, headers=FIXED_HEADERS)

    return Response(content=r.content, status_code=r.status_code, media_type="application/json")
