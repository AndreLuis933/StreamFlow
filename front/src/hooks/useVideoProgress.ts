// hooks/useVideoProgress.ts
import { useRef, useCallback } from "react";

interface UseVideoProgressReturn {
  saveProgress: (currentTime: number) => void;
  getProgress: () => number;
  clearProgress: () => void;
  hasRestoredProgress: React.MutableRefObject<boolean>;
}

export const useVideoProgress = (videoId: string): UseVideoProgressReturn => {
  const hasRestoredProgress = useRef(false);
  const STORAGE_KEY = `video-progress-${videoId}`;

  const saveProgress = useCallback(
    (currentTime: number) => {
      localStorage.setItem(STORAGE_KEY, currentTime.toString());
    },
    [STORAGE_KEY]
  );

  const getProgress = useCallback((): number => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const progress = saved ? parseFloat(saved) : 0;
    return progress;
  }, [STORAGE_KEY]);

  const clearProgress = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, [STORAGE_KEY]);

  return {
    saveProgress,
    getProgress,
    clearProgress,
    hasRestoredProgress,
  };
};
