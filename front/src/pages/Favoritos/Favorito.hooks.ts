import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEpisodesFetcher } from "@/hooks/useEpisodesFetcher";
import { getFavorites } from "@/services/firebase";

export interface FavoriteSerie {
  slug: string;
  title: string;
  id: string;
}

export function useFavorito() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [tabValue, setTabValue] = useState(0);

  const [favorites, setFavorites] = useState<FavoriteSerie[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);

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
