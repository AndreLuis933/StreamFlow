from flask import Flask, Response, send_file
import requests
import threading
import os

app = Flask(__name__)

# Controle de downloads
downloads = {}


class VideoDownloader:
    def __init__(self, url, filename):
        self.url = url
        self.filename = filename
        self.downloading = True
        self.bytes_downloaded = 0
        self.total_size = 0

    def download(self):
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Referer": "https://www.api-vidios.net/watch/e/dNqNrpsLtB",
        }

        try:
            response = requests.get(self.url, headers=headers, stream=True)
            self.total_size = int(response.headers.get("content-length", 0))

            with open(self.filename, "wb") as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        self.bytes_downloaded += len(chunk)

            self.downloading = False
            print(f"Download completo: {self.filename}")
        except Exception as e:
            print(f"Erro no download: {e}")
            self.downloading = False


@app.route("/video/<path:video_id>")
def stream_video(video_id):
    url = f"https://cdn-zenitsu-2-gamabunta.b-cdn.net/cf/hls/animes/boku-no-hero-academia-final/{video_id}"
    filename = f"downloads/{video_id.replace('/', '_')}"

    # Criar pasta se não existir
    os.makedirs("downloads", exist_ok=True)

    # Se já existe o arquivo completo, servir direto
    if os.path.exists(filename) and video_id not in downloads:
        return send_file(filename, mimetype="video/mp4")

    # Se não está baixando ainda, iniciar download
    if video_id not in downloads:
        downloader = VideoDownloader(url, filename)
        downloads[video_id] = downloader
        thread = threading.Thread(target=downloader.download)
        thread.daemon = True
        thread.start()

    # Fazer streaming enquanto baixa
    def generate():
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Referer": "https://www.api-vidios.net/watch/e/dNqNrpsLtB",
        }

        response = requests.get(url, headers=headers, stream=True)

        for chunk in response.iter_content(chunk_size=8192):
            if chunk:
                yield chunk

    return Response(generate(), mimetype="video/mp4")


@app.route("/status/<path:video_id>")
def download_status(video_id):
    if video_id in downloads:
        d = downloads[video_id]
        return {
            "downloading": d.downloading,
            "progress": f"{d.bytes_downloaded}/{d.total_size}",
            "percent": round((d.bytes_downloaded / d.total_size) * 100, 2) if d.total_size > 0 else 0,
        }
    return {"downloading": False, "message": "Não encontrado"}


if __name__ == "__main__":
    app.run(port=3000, threaded=True)
