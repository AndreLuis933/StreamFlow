// hooks/setupHlsPlayer.ts
import Hls from "hls.js";

interface SetupHlsPlayerProps {
  src: string;
  video: HTMLVideoElement;
}

export const setupHlsPlayer = ({ src, video }: SetupHlsPlayerProps) => {
  if (!Hls.isSupported()) {
    console.error("HLS não suportado neste navegador");
    return;
  }

  const hls = new Hls({
    maxBufferLength: 90,
    maxMaxBufferLength: 180,
    autoStartLoad: true,
    maxBufferSize: 100 * 1000 * 1000,
    abrBandWidthFactor: 0.8,
  });

  hls.loadSource(src);
  hls.attachMedia(video);

  hls.on(Hls.Events.ERROR, (_, data) => {
    console.warn("[HLS ERROR]", {
      type: data.type,
      details: data.details,
      fatal: data.fatal,
      response: data.response,
    });

    if (data.fatal) {
      switch (data.type) {
        case Hls.ErrorTypes.NETWORK_ERROR:
          console.warn("Erro de rede fatal no HLS, tentando novamente...");
          hls.startLoad();
          break;
        case Hls.ErrorTypes.MEDIA_ERROR:
          console.warn("Erro de mídia fatal no HLS, tentando recuperar...");
          hls.recoverMediaError();
          break;
        default:
          console.error("Erro fatal não recuperável, destruindo HLS.");
          hls.destroy();
      }
    }
  });

  return () => {
    hls.destroy();
  };
};
