import numpy as np
from scipy.ndimage import maximum_filter
from scipy.signal import medfilt2d, stft


def fingerprint_audio_array(
    y: np.ndarray,
    sr: int,
    n_fft: int = 2048,
    hop_length: int = 512,
    fan_value: int = 15,
    peak_neighborhood_size: tuple = (20, 20),
    max_dt_s: float = 2.0,
) -> list[dict]:
    """Retorna lista [{'hash': str, 'time': float}, ...]."""
    noverlap = n_fft - hop_length

    pad_amount = n_fft // 2
    y_padded = np.pad(y, (pad_amount, pad_amount), mode="reflect")

    f, t, Zxx = stft(y_padded, fs=sr, nperseg=n_fft, noverlap=noverlap, window="hann", boundary=None, padded=False)

    s = np.abs(Zxx)

    s = medfilt2d(s, kernel_size=3)
    peaks = maximum_filter(s, size=peak_neighborhood_size) == s
    freqs_idx, times_idx = np.where(peaks)

    freq_vals = freqs_idx * (sr / n_fft)
    time_vals = times_idx * (hop_length / sr)

    order = np.argsort(time_vals)
    freq_vals = freq_vals[order]
    time_vals = time_vals[order]

    hashes = []
    size = len(time_vals)

    for i in range(size):
        f1 = int(freq_vals[i])
        t1 = float(time_vals[i])

        for j in range(1, fan_value):
            if i + j >= size:
                break

            t2 = float(time_vals[i + j])
            dt = t2 - t1

            if dt <= 0 or dt > max_dt_s:
                continue

            f2 = int(freq_vals[i + j])

            h = f"{f1}|{f2}|{int(dt * 100)}"
            hashes.append({"hash": h, "time": round(t1, 3)})

    return hashes
