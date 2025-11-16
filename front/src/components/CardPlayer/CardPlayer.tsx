import { useRef, useEffect } from "react";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import { useVideoProgress } from "@/hooks/useVideoProgress";
import { setupHlsPlayer } from "@/hooks/setupHlsPlayer";
import { fetchIntroDuration, fetchCreditsDuration } from "@/services/anime";
import "./button.css";
import { waitForPlayer } from "@/utils/waitForPlayer";
import { attachKeyboardListeners } from "@/hooks/listeners/keyboardListeners";
import { attachIntroButton } from "@/hooks/listeners/introButtonListeners";
import { attachCreditsButton } from "@/hooks/listeners/creditsButtonListeners";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface CardPlayerProps {
  thumbnail: string;
  videoId: string;
  onVideoEnd: () => void;
  nome: string;
  ep: string;
}

const CardPlayer = ({
  thumbnail,
  videoId,
  onVideoEnd,
  nome,
  ep,
}: CardPlayerProps) => {
  const plyrRef = useRef<any>(null);
  const src = `${API_BASE}/m3u8?nome=${encodeURIComponent(
    nome
  )}&ep=${encodeURIComponent(ep)}`;

  const introButtonRef = useRef<HTMLButtonElement | null>(null);
  const introDurationRef = useRef<{
    start_sec: number;
    end_sec: number;
  } | null>(null);
  const creditsButtonRef = useRef<HTMLButtonElement | null>(null);
  const creditsDurationRef = useRef<{
    start_sec: number;
    end_sec: number;
  } | null>(null);

  const {  hasRestoredProgress } =
    useVideoProgress(videoId);

  // const restoreProgress = useCallback(
  //   (video: HTMLVideoElement) => {
  //     if (hasRestoredProgress.current) return;

  //     const savedTime = getProgress();
  //     if (savedTime > 0 && video.duration) {
  //       video.currentTime = savedTime;
  //       hasRestoredProgress.current = true;
  //     }
  //   },
  //   [getProgress, hasRestoredProgress]
  // );

  // useEffect(() => {
  //   return waitForPlayer(plyrRef, (_, video) => {
  //     return attachVideoListeners({ video, saveProgress, restoreProgress });
  //   });
  // }, [videoId]);

  useEffect(() => {
    return waitForPlayer(plyrRef, () => {
      return attachKeyboardListeners({ onVideoEnd });
    });
  }, [videoId]);

  useEffect(() => {
    return waitForPlayer(plyrRef, (player, video) => {
      return attachIntroButton({
        player,
        video,
        fetchIntroDuration,
        nome,
        ep,
        introButtonRef,
        introDurationRef,
      });
    });
  }, [videoId]);

  useEffect(() => {
    return waitForPlayer(plyrRef, (player, video) => {
      return attachCreditsButton({
        player,
        video,
        fetchCreditsDuration,
        nome,
        ep,
        creditsButtonRef,
        creditsDurationRef,
        onVideoEnd,
      });
    });
  }, [videoId]);

  useEffect(() => {
    return waitForPlayer(plyrRef, (_, video) => {
      return setupHlsPlayer({
        src,
        video,
      });
    });
  }, [videoId]);

  useEffect(() => {
    hasRestoredProgress.current = false;
  }, [videoId]);

  return (
    <Plyr
      ref={plyrRef}
      source={{
        type: "video",
        sources: [],
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
  );
};

export default CardPlayer;
