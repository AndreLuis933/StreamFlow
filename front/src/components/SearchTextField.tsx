import { useEffect, useState } from "react";
import { TextField } from "@mui/material";
import axios from "axios";
import styled from "styled-components";
import { useDebounce } from "../hooks/useDebounce";
import { TYPE_MAP } from "../consts/const";
import type { ApiDataResponse } from "../types/typeApi";

const FieldWrap = styled.div`
  position: relative;
  width: 360px;
`;

const FloatCard = styled.div<{ $show: boolean }>`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 100%;
  background: #1e1e1e;
  border: 1px solid #2a2a2a;
  border-radius: 10px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4);
  padding: 8px 0;
  max-height: 300px;
  overflow-y: auto;
  z-index: 10;
  display: ${(p) => (p.$show ? "block" : "none")};
`;

const Item = styled.a`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  text-decoration: none;
  color: #eaeaea;
  padding: 10px 12px;
  font-size: 14px;
  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
`;

const Cover = styled.img`
  width: 130px;
  height: 209px;
  border-radius: 6px;
  object-fit: cover;
`;

const Title = styled.span`
  font-weight: 600;
  line-height: 1.2;
`;

const BoxTitulo = styled.div`
  display: flex;
  flex-direction: column;
`;

const Synopsis = styled.p`
  margin: 0;
  color: #bdbdbd;
  font-size: 13px;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const SearchTextField = () => {
  const [anime, setAnime] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<ApiDataResponse["data"]>([]);
  const debounced = useDebounce(anime, 400);

  useEffect(() => {
    const fetchData = async () => {
      if (debounced.trim().length > 2) {
        try {
          const r = await axios.get<ApiDataResponse>(
            `http://localhost:8000/data?q=${encodeURIComponent(debounced)}`
          );
          setResults(r.data?.data ?? []);
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
  const getCoverUrl = (slug: string, type: string, size = "130x209") => {
    const tipo = TYPE_MAP[type];
    return `https://static.api-vidios.net/images/${tipo}/capas/${size}/${slug}.jpg`;
  };

  return (
    <FieldWrap>
      <TextField
        label="Busca por Animes"
        variant="outlined"
        value={anime}
        onChange={(e) => setAnime(e.target.value)}
        onFocus={() => results.length && setOpen(true)}
        fullWidth
      />
      <FloatCard $show={open}>
        {results.length === 0 ? (
          <Item href="">Nenhum resultado</Item>
        ) : (
          results.map((it) => (
            <Item key={`${it.type}:${it.id}`} href={it.generic_path}>
              <Cover src={getCoverUrl(it.slug, it.type)} alt={it.title} />
              <BoxTitulo>
                <Title>{it.title}</Title>
                {it.synopsis && <Synopsis>{it.synopsis}</Synopsis>}
              </BoxTitulo>
            </Item>
          ))
        )}
      </FloatCard>
    </FieldWrap>
  );
};

export default SearchTextField;
