import numpy as np
from config.loggin import measure_time
from numpy.lib.stride_tricks import sliding_window_view


def fast_max_filter_2d(img: np.ndarray, size: tuple) -> np.ndarray:
    """Implementação otimizada de maximum_filter usando a propriedade separável.
    Faz o max em um eixo, depois no outro. Reduz complexidade de O(N*M) para O(N+M).
    """
    # 1. Max no eixo 0 (Frequência)
    k_f = size[0]
    pad_f = k_f // 2
    # Pad para manter o tamanho. Se k_f for par (ex: 20), pad=10 de cada lado gera tamanho N+1, cortamos depois.
    img_padded_f = np.pad(img, ((pad_f, pad_f), (0, 0)), mode="constant")
    windows_f = sliding_window_view(img_padded_f, window_shape=k_f, axis=0)
    max_f = np.max(windows_f, axis=-1)
    # Ajuste fino de tamanho (corta excesso se houver)
    max_f = max_f[: img.shape[0], :]

    # 2. Max no eixo 1 (Tempo) - aplicado sobre o resultado anterior
    k_t = size[1]
    pad_t = k_t // 2
    img_padded_t = np.pad(max_f, ((0, 0), (pad_t, pad_t)), mode="constant")
    windows_t = sliding_window_view(img_padded_t, window_shape=k_t, axis=1)
    max_t = np.max(windows_t, axis=-1)
    # Ajuste fino de tamanho
    return max_t[:, : img.shape[1]]


def fingerprint_audio_array(
    y: np.ndarray,
    sr: int,
    n_fft: int = 2048,
    hop_length: int = 512,
    fan_value: int = 15,
    peak_neighborhood_size: tuple = (20, 20),
    max_dt_s: float = 2.0,
) -> list[dict]:
    with measure_time("STFT Calculation (NumPy)"):
        window = np.hanning(n_fft)
        pad_width = n_fft // 2
        y_padded = np.pad(y, pad_width, mode="reflect")

        shape = y_padded.shape[:-1] + ((y_padded.shape[-1] - n_fft) // hop_length + 1, n_fft)
        strides = y_padded.strides[:-1] + (y_padded.strides[-1] * hop_length, y_padded.strides[-1])
        frames = np.lib.stride_tricks.as_strided(y_padded, shape=shape, strides=strides)

        Zxx = np.fft.rfft(frames * window, axis=1).T
        s = np.abs(Zxx)

    with measure_time("Peak Finding (NumPy Separable)"):
        local_max = fast_max_filter_2d(s, peak_neighborhood_size)

        # Boolean mask
        peaks = (s == local_max) & (s > 0)
        freqs_idx, times_idx = np.where(peaks)

    with measure_time("Sorting Peaks"):
        freq_vals = freqs_idx * (sr / n_fft)
        time_vals = times_idx * (hop_length / sr)

        order = np.argsort(time_vals)
        freq_vals = freq_vals[order]
        time_vals = time_vals[order]

    hashes = []
    size = len(time_vals)

    with measure_time("Hashing Loop"):
        f_list = freq_vals.astype(int).tolist()
        t_list = time_vals.tolist()

        for i in range(size):
            f1 = f_list[i]
            t1 = t_list[i]

            for j in range(1, fan_value):
                if i + j >= size:
                    break

                t2 = t_list[i + j]
                dt = t2 - t1

                if dt <= 0 or dt > max_dt_s:
                    continue

                f2 = f_list[i + j]
                h = f"{f1}|{f2}|{int(dt * 100)}"
                hashes.append({"hash": h, "time": round(t1, 3)})

    return hashes
