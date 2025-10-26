import yt_dlp


def baixar_video_m3u8(url, caminho_saida="teste.mp4"):
    ydl_opts = {
        "outtmpl": caminho_saida,
        "concurrent_fragment_downloads": 16,
        "http_headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Referer": "https://www.api-vidios.net/watch/e/dNqNrpsLtB",
        },
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])

        print("Download concluído com sucesso!")
        return True

    except Exception as e:
        print(f"Erro ao baixar vídeo: {e}")
        return False


# Exemplo de uso
if __name__ == "__main__":
    url_m3u8 = "https://cdn-zenitsu-2-gamabunta.b-cdn.net/cf/hls/animes/boku-no-hero-academia-final/003.mp4/media-1/stream.m3u8"
    baixar_video_m3u8(url_m3u8)
