import { useRef, useEffect, useCallback } from "react";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import { useVideoProgress } from "@/hooks/useVideoProgress";
import { useHlsPlayer } from "@/hooks/useHlsPlayer";
import { useVideoEventListeners } from "@/hooks/useVideoEventListeners";

interface CardPlayerProps {
  src: string;
  thumbnail: string;
  videoId: string;
  onVideoEnd: () => void;
  nome: string;
  ep: string;
}

const CardPlayer = ({
  src,
  thumbnail,
  videoId,
  onVideoEnd,
  nome,
  ep,
}: CardPlayerProps) => {
  const plyrRef = useRef<any>(null);

  function CustomButton() {
    const container = plyrRef.current?.plyr.elements.container; // container do player
    if (!container) return;

    // Evita adicionar múltiplas vezes
    if (container.querySelector(".custom-center-button")) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "custom-center-button";
    btn.setAttribute("aria-label", "Custom Center Button");
    btn.textContent = "Pular Abertura";

    btn.addEventListener("click", () => {
      console.log("Botão custom clicado!");
    });

    container.appendChild(btn);
  }

  const { saveProgress, getProgress, clearProgress, hasRestoredProgress } =
    useVideoProgress(videoId);

  const restoreProgress = useCallback(
    (video: HTMLVideoElement) => {
      if (hasRestoredProgress.current) return;

      const savedTime = getProgress();
      if (savedTime > 0 && video.duration) {
        video.currentTime = savedTime;
        hasRestoredProgress.current = true;
      }
    },
    [getProgress, hasRestoredProgress]
  );

  useHlsPlayer({
    src,
    videoId,
    plyrRef,
    onManifestParsed: restoreProgress,
  });

  useVideoEventListeners({
    plyrRef,
    videoId,
    onVideoEnd,
    saveProgress,
    clearProgress,
    restoreProgress,
    nome,
    ep,
  });

  useEffect(() => {
    hasRestoredProgress.current = false;
  }, [videoId]);


  return (
    <>
      <Plyr
        ref={plyrRef}
        source={{
          type: "video",
          sources: [
            {
              src: src,
              type: "application/x-mpegURL",
            },
          ],
          poster: thumbnail,
        }}
        options={{
          keyboard: {
            focused: true,
            global: true,
          },
          seekTime: 10,
          tooltips: { controls: true, seek: true },
          ratio: "16:9",
          controls: [
            "play",
            "progress",
            "current-time",
            "mute",
            "volume",
            "settings",
            "fullscreen",
          ],
          settings: ["speed"],
          speed: {
            selected: 1,
            options: [0.5, 0.75, 1, 1.25, 1.5, 2],
          },
        }}
      />
      <style>{`
  .custom-center-button {
    position: absolute;
    bottom: 50px;
    right: 10px;
    z-index: 9999;
    padding: 5px 15px;
    font-size: 16px;
    background-color: #fff;
    border: none;
    border-radius: 2px;
    color: black;
    cursor: pointer;
    user-select: none;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    transition: background-color 0.3s ease, box-shadow 0.3s ease;
  }
  .custom-center-button:hover {
    background-color: #fff9;
  }
`}</style>
    </>
  );
};

export default CardPlayer;
