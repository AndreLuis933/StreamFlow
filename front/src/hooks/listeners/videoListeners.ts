// hooks/videoListeners.ts
export type CleanupFn = () => void;

export function attachVideoListeners({
  video,
  saveProgress,
  restoreProgress,
}: {
  video: HTMLVideoElement;
  saveProgress: (currentTime: number) => void;
  restoreProgress: (video: HTMLVideoElement) => void;
}): CleanupFn {
  let saveInterval: NodeJS.Timeout | null = null;

  const handleLoadedMetadata = () => {
    restoreProgress(video);
  };

  const handleCanPlay = () => {
    restoreProgress(video);
  };

  const startSaving = () => {
    if (saveInterval) clearInterval(saveInterval);
    saveInterval = setInterval(() => {
      if (!video.paused && !video.ended && video.currentTime > 0) {
        saveProgress(video.currentTime);
      }
    }, 2000);
  };

  const handlePause = () => {
    if (video.currentTime > 0) {
      saveProgress(video.currentTime);
    }
  };

  video.addEventListener("loadedmetadata", handleLoadedMetadata);
  video.addEventListener("canplay", handleCanPlay);
  video.addEventListener("play", startSaving);
  video.addEventListener("pause", handlePause);

  return () => {
    video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    video.removeEventListener("canplay", handleCanPlay);
    video.removeEventListener("play", startSaving);
    video.removeEventListener("pause", handlePause);
    if (saveInterval) clearInterval(saveInterval);
  };
}
