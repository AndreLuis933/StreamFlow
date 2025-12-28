import { useEffect, useState, useRef } from "react";
import { Search as SearchIcon } from "@mui/icons-material";
import * as S from "../Header.styles";

import type { DetalhesSerieResponse } from "@/types/api";
import { fetchCatalago, fetchDetalhesSerieBySlug } from "@/services/serie";
import { getSerieImageUrlBySlug } from "@/utils/images";

const SearchComponent = () => {
  const [serie, setSerie] = useState("");
  const [open, setOpen] = useState(false);
  const [allSeries, setAllSeries] = useState<string[]>([]);
  const [filteredSeries, setFilteredSeries] = useState<string[]>([]);
  const [detalhesMap, setDetalhesMap] = useState<
    Map<string, DetalhesSerieResponse>
  >(new Map());
  const [loading, setLoading] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const r = await fetchCatalago();
      setAllSeries(r.series);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const termoLower = serie.toLowerCase().trim();

    if (!termoLower) {
      setFilteredSeries([]);
      return;
    }

    const resultados = allSeries.filter((nome) =>
      nome.toLowerCase().includes(termoLower)
    );
    setFilteredSeries(resultados);
  }, [serie, allSeries]);

  useEffect(() => {
    const fetchDetalhes = async () => {
      if (filteredSeries.length === 0) return;

      setLoading(true);
      const novoMap = new Map(detalhesMap);

      const promises = filteredSeries.map(async (nome) => {
        if (!novoMap.has(nome)) {
          try {
            const detalhes = await fetchDetalhesSerieBySlug(nome);
            novoMap.set(nome, detalhes);
          } catch (error) {
            console.error(`Erro ao buscar detalhes de ${nome}:`, error);
          }
        }
      });

      await Promise.all(promises);
      setDetalhesMap(novoMap);
      setLoading(false);
    };

    fetchDetalhes();
  }, [filteredSeries]);

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

  return (
    <S.SearchContainer ref={wrapperRef}>
      <S.SearchIconWrapper>
        <SearchIcon />
      </S.SearchIconWrapper>

      <S.StyledInputBase
        placeholder="Busca por Series..."
        inputProps={{ "aria-label": "search" }}
        value={serie}
        onChange={(e) => {
          const value = e.target.value;
          setSerie(value);
          if (value.length > 0) setOpen(true);
        }}
        onFocus={() => {
          if (filteredSeries.length > 0 || serie.length > 0) setOpen(true);
        }}
      />

      <S.FloatCard $show={open}>
        {loading && filteredSeries.length > 0 ? (
          <div
            style={{
              padding: "12px",
              color: "#999",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            Carregando...
          </div>
        ) : filteredSeries.length === 0 ? (
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
          filteredSeries.map((nome) => {
            const detalhes = detalhesMap.get(nome);

            if (!detalhes) return null;

            return (
              <S.ResultItem
                key={detalhes.id}
                href={`/serie/${detalhes.slug_serie}`}
              >
                <S.ResultCover
                  src={getSerieImageUrlBySlug(detalhes.slug_serie)}
                  alt={detalhes.title}
                />
                <S.ResultInfo>
                  <S.ResultTitle>{detalhes.title}</S.ResultTitle>
                  {detalhes.sinopse && (
                    <S.ResultSynopsis>{detalhes.sinopse}</S.ResultSynopsis>
                  )}
                </S.ResultInfo>
              </S.ResultItem>
            );
          })
        )}
      </S.FloatCard>
    </S.SearchContainer>
  );
};

export default SearchComponent;
