from typing import Annotated

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from src.config.loggin import measure_time

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/intro")
async def get_intro(anime: Annotated[str, Query(...)], ep: Annotated[str, Query(...)]):
    with measure_time("Caregar codigo principal"):
        from src.run import find_seguement_request
    with measure_time("Tempo total da tarefa"):
        return await find_seguement_request(anime, ep, "intro")


@app.get("/credits")
async def get_credits(anime: Annotated[str, Query(...)], ep: Annotated[str, Query(...)]):
    from src.run import find_seguement_request

    return await find_seguement_request(anime, ep, "credits")
