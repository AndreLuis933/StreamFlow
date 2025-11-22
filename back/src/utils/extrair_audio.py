import io

import av
import numpy as np
from src.config.config import SR_TARGET


def converter_buffer_to_numpy(buffer_completo):
    """Retorna um np.array (float32) normalizado e o sample rate."""
    if not buffer_completo:
        return None

    try:
        input_file = io.BytesIO(buffer_completo)

        with av.open(input_file) as container:
            if not container.streams.audio:
                return None

            audio_stream = container.streams.audio[0]

            # Configura para s16 (int16), mono, taxa alvo
            resampler = av.AudioResampler(
                format="s16",
                layout="mono",
                rate=SR_TARGET,
            )

            arrays = []

            for frame in container.decode(audio_stream):
                resampled_frames = resampler.resample(frame)
                for r_frame in resampled_frames:
                    numpy_frame = r_frame.to_ndarray()
                    arrays.append(numpy_frame[0])

            if not arrays:
                return None

            # Agora concatenamos uma lista de arrays 1D, resultando em um array 1D longo
            audio_int16 = np.concatenate(arrays)

            # Conversão para float32 (-1.0 a 1.0)
            return audio_int16.astype(np.float32) / 32768.0


    except Exception as e:
        print(f"❌ Erro crítico no PyAV: {e}")
        return None
