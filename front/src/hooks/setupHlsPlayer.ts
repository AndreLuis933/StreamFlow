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
    maxBufferLength: 60,
    maxMaxBufferLength: 600,
    maxBufferSize: 150 * 1000 * 1000,

    fragLoadingMaxRetry: 10,
    fragLoadingRetryDelay: 1000,
    fragLoadingTimeOut: 20000,

    maxBufferHole: 0.5,

    enableWorker: true,
    lowLatencyMode: false,
    autoStartLoad: true,
  });

  hls.loadSource(src);
  hls.attachMedia(video);

hls.on(Hls.Events.ERROR, (_, data) => {
  if (data.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR) return;

  if (
    data.details === Hls.ErrorDetails.FRAG_LOAD_ERROR ||
    data.details === Hls.ErrorDetails.FRAG_LOAD_TIMEOUT
  ) {
    if (!data.fatal) return;

    const badFrag = data.frag;

    if (!badFrag) {
      console.warn(
        "Erro de fragmento detectado, mas sem dados do fragmento. Ignorando."
      );
      return;
    }
    // ---------------------

    const currentTime = video.currentTime;
    const bufferGap = badFrag.start - currentTime;

    // CENÁRIO 1: O erro está longe (Pre-load)
    if (bufferGap > 2.0) {
      console.warn(
        `Segmento futuro ${badFrag.sn} falhou. O download vai pausar.`
      );
      return;
    }

    // CENÁRIO 2: O usuário chegou no buraco
    const jumpToTime = badFrag.start + badFrag.duration + 0.1;

    console.warn(
      `PULANDO SEGMENTO RUIM: De ${currentTime.toFixed(
        2
      )}s para ${jumpToTime.toFixed(2)}s`
    );

    video.currentTime = jumpToTime;
    hls.startLoad();
    return;
  }

  if (data.fatal) {
    switch (data.type) {
      case Hls.ErrorTypes.MEDIA_ERROR:
        console.warn("Erro de mídia fatal, tentando recuperar...");
        hls.recoverMediaError();
        break;
      default:
        console.error("Erro fatal irrecuperável.");
        hls.destroy();
        break;
    }
  }
});

  return () => {
    hls.destroy();
  };
};
