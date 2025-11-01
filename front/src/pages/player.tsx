import React, { useEffect, useRef } from "react";
import Plyr from "plyr";
import "plyr/dist/plyr.css";
import Hls from "hls.js";

type Props = {
  titulo: string;
  ep: string;
  backendBase?: string; // default http://localhost:8000
};

const HlsPlyr: React.FC<Props> = ({
  titulo,
  ep,
  backendBase = "http://localhost:8000",
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const plyrRef = useRef<Plyr | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const m3u8Url = `${backendBase}/m3u8?nome=${encodeURIComponent(
    titulo
  )}&ep=${encodeURIComponent(ep)}`;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // 1) Limpeza total de instâncias anteriores
    if (plyrRef.current) {
      try {
        plyrRef.current.destroy();
      } catch {}
      plyrRef.current = null;
    }
    if (hlsRef.current) {
      try {
        hlsRef.current.destroy();
      } catch {}
      hlsRef.current = null;
    }

    // Remova qualquer src/URL residual do video
    try {
      video.pause();
    } catch {}
    video.removeAttribute("src");
    // Evitar que Plyr mexa em src antes do Hls
    // video.load(); // opcional

    // 2) Inicialização
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30,
        maxBufferLength: 30,
      });
      hlsRef.current = hls;

      hls.attachMedia(video);
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(m3u8Url);
      });

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // 3) Só agora inicialize o Plyr
        plyrRef.current = new Plyr(video, {
          autoplay: true,
          controls: [
            "play",
            "progress",
            "current-time",
            "mute",
            "volume",
            "settings",
            "fullscreen",
          ],
          settings: ["quality", "speed"],
          speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
        });
        // Tente dar play
        video.play().catch(() => {});
      });

      // Logs úteis (opcional)
      hls.on(Hls.Events.ERROR, (_, data) => {
        console.warn("[HLS][ERROR]", data.type, data.details, data);
      });

      return () => {
        // 4) Ordem de destruição: Plyr depois Hls
        try {
          plyrRef.current?.destroy();
        } catch {}
        plyrRef.current = null;

        try {
          hlsRef.current?.destroy();
        } catch {}
        hlsRef.current = null;

        // Limpa o <video> para evitar blobs órfãos
        if (video) {
          try {
            video.pause();
          } catch {}
          video.removeAttribute("src");
          // video.load(); // opcional
        }
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari: HLS nativo
      video.src = m3u8Url;
      plyrRef.current = new Plyr(video, {
        autoplay: true,
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
      });
      video.addEventListener("loadedmetadata", () => {
        video.play().catch(() => {});
      });

      return () => {
        try {
          plyrRef.current?.destroy();
        } catch {}
        plyrRef.current = null;
        if (video) {
          try {
            video.pause();
          } catch {}
          video.removeAttribute("src");
          // video.load();
        }
      };
    } else {
      console.error("HLS não é suportado neste navegador.");
    }
  }, [m3u8Url]);

  return (
    <video
      ref={videoRef}
      playsInline
      controls
      style={{ width: "100%", maxWidth: 960 }}
    />
  );
};

export default HlsPlyr;
