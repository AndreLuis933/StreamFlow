// hooks/useHlsPlayer.ts
import { useEffect, useRef } from "react";
import Hls from "hls.js";

interface UseHlsPlayerProps {
  src: string;
  videoId: string;
  plyrRef: React.MutableRefObject<any>;
  onManifestParsed: (video: HTMLVideoElement) => void;
}

export const useHlsPlayer = ({
  src,
  videoId,
  plyrRef,
  onManifestParsed,
}: UseHlsPlayerProps) => {
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = plyrRef.current?.plyr?.media;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        maxBufferLength: 90, // mantém 90s de buffer para smooth playback
        maxMaxBufferLength: 180, // limite máximo do buffer
        autoStartLoad: true, // começa a carregar automaticamente
        maxBufferSize: 100 * 1000 * 1000, // limite de 100MB de buffer
        abrBandWidthFactor: 0.8, // margem para evitar buffering
      });
      hlsRef.current = hls;

      hls.loadSource(src);
      hls.attachMedia(video);

      // Aguardar o manifest ser parseado para garantir que o vídeo está pronto
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("✅ HLS Manifest carregado");
        // Pequeno delay para garantir que tudo está inicializado
        setTimeout(() => onManifestParsed(video), 100);
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        console.error("HLS Error:", data);
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Fallback para navegadores que suportam HLS nativamente (Safari)
      video.src = src;
    }

    return () => {
      // Limpar instância do HLS para evitar memory leaks
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [src, videoId, plyrRef, onManifestParsed]);

  return hlsRef;
};
