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
    // 1. Estratégia de Buffer Agressiva (Seu objetivo)
    // Tenta manter 60s garantidos, mas permite crescer até 600s (10 min) ou mais
    maxBufferLength: 60,
    maxMaxBufferLength: 600,
    maxBufferSize: 150 * 1000 * 1000, // 120MB (Cuidado: muito alto pode travar o browser em mobile)

    // 2. Tolerância ao Proxy (CRUCIAL)
    // Aumenta o tempo que o HLS espera o proxy começar a responder antes de dar erro
    fragLoadingTimeOut: 65000, // 20s (padrão é 20s, mas garanta que não está baixo)
    manifestLoadingTimeOut: 65000,
    levelLoadingTimeOut: 65000,

    // 3. Evitar o "Stall" (Travamento)
    // Se faltar um pedacinho de 0.5s, ele pula em vez de travar a tela
    maxBufferHole: 0.5,

    // Se travar, tenta empurrar o vídeo um pouco mais agressivamente
    nudgeOffset: 0.2,
    nudgeMaxRetry: 5,

    // 4. Configurações de Rede
    enableWorker: true, // Usa webworkers para não travar a UI enquanto baixa muito
    lowLatencyMode: false, // Desativa modo low-latency (essencial para VOD estável)
    autoStartLoad: true,
  });

  hls.loadSource(src);
  hls.attachMedia(video);

  hls.on(Hls.Events.ERROR, (_, data) => {
    // Ignora logs de stall se o Hls.js estiver tentando recuperar (nudge)
    if (
      data.details === "bufferStalledError" ||
      data.details === "bufferNudgeOnStall"
    ) {
      return;
    }

    // Se for um timeout, agora sabemos que demorou mais de 65s (o proxy falhou mesmo)
    if (data.type === Hls.ErrorTypes.NETWORK_ERROR && data.fatal) {
      console.warn(
        "Timeout excedido (Proxy demorou +65s ou falhou). Tentando reconectar..."
      );
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
