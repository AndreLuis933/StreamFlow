from typing import Annotated

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from src.run import find_seguement_request

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
    return await find_seguement_request(anime, ep, "intro")


@app.get("/credits")
async def get_credits(anime: Annotated[str, Query(...)], ep: Annotated[str, Query(...)]):
    return await find_seguement_request(anime, ep, "credits")
