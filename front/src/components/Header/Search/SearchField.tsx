import { useEffect, useState, useRef } from "react";
import { Search as SearchIcon } from "@mui/icons-material";
import * as S from "../Header.styles";

import { useDebounce } from "@/hooks/useDebounce";
import { TYPE_MAP } from "@/consts/const";
import type { ApiDataResponse } from "@/types/api";
import { fetchAnimeBySearch } from "@/services/anime";

const SearchComponent = () => {
  const [anime, setAnime] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<ApiDataResponse["data"]>([]);
  const debounced = useDebounce(anime, 400);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (debounced.trim().length > 2) {
        try {
          const r = await fetchAnimeBySearch(debounced);
          setResults(r.data ?? []);
          setOpen(true);
        } catch (e) {
          setResults([]);
          setOpen(true);
          console.error(e);
        }
      } else {
        setResults([]);
        setOpen(false);
      }
    };
    fetchData();
  }, [debounced]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getCoverUrl = (slug: string, type: string, size = "130x209") => {
    const tipo = TYPE_MAP[type] || "animes";
    return `https://static.api-vidios.net/images/${tipo}/capas/${size}/${slug}.jpg`;
  };

  return (
    <S.SearchContainer ref={wrapperRef}>
      <S.SearchIconWrapper>
        <SearchIcon />
      </S.SearchIconWrapper>

      <S.StyledInputBase
        placeholder="Busca por Animes..."
        inputProps={{ "aria-label": "search" }}
        value={anime}
        onChange={(e) => setAnime(e.target.value)}
        onFocus={() => {
          if (results.length > 0 || anime.length > 2) setOpen(true);
        }}
      />

      <S.FloatCard $show={open}>
        {results.length === 0 ? (
          <div
            style={{
              padding: "12px",
              color: "#999",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            Nenhum resultado encontrado
          </div>
        ) : (
          results.map((it) => (
            <S.ResultItem key={`${it.type}:${it.id}`} href={it.generic_path}>
              <S.ResultCover
                src={getCoverUrl(it.slug, it.type)}
                alt={it.title}
              />
              <S.ResultInfo>
                <S.ResultTitle>{it.title}</S.ResultTitle>
                {it.synopsis && (
                  <S.ResultSynopsis>{it.synopsis}</S.ResultSynopsis>
                )}
              </S.ResultInfo>
            </S.ResultItem>
          ))
        )}
      </S.FloatCard>
    </S.SearchContainer>
  );
};

export default SearchComponent;
