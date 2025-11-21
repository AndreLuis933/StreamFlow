import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEpisodesFetcher } from "@/hooks/useEpisodesFetcher";
import { getFavorites } from "@/services/firebase";

export interface FavoriteAnime {
  slug: string;
  title: string;
  id: string;
}

export function useHome() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Controle da Tab ativa (0 = Episódios, 1 = Animes)
  const [tabValue, setTabValue] = useState(0);

  // Estado para armazenar a lista completa de objetos
  const [favorites, setFavorites] = useState<FavoriteAnime[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  // Extrai apenas os slugs para passar para o hook de episódios
  const slugsList = useMemo(() => favorites.map((f) => f.id), [favorites]);

  const { episodes, loading: loadingEpisodes } = useEpisodesFetcher({
    slugs: slugsList,
  });

  useEffect(() => {
    async function fetchMyFavorites() {
      if (!currentUser) return;
      try {
        setLoadingFavorites(true);
        const data = await getFavorites(currentUser.uid);
        setFavorites(data);
      } catch (error) {
        console.error("Erro ao buscar favoritos:", error);
      } finally {
        setLoadingFavorites(false);
      }
    }
    fetchMyFavorites();
  }, [currentUser]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const isLoading = loadingFavorites || (tabValue === 0 && loadingEpisodes);

  return {
    currentUser,
    tabValue,
    handleTabChange,
    favorites,
    loadingFavorites,
    episodes,
    isLoading,
    navigate,
  };
}
