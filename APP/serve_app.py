import http.server
import socketserver
import socket
import os

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)


def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        return s.getsockname()[0]
    except Exception:
        return "127.0.0.1"
    finally:
        s.close()

if __name__ == "__main__":
    local_ip = get_local_ip()
    print(f"Servindo a pasta: {DIRECTORY}")
    print(f"Acesse localmente: http://localhost:{PORT}")
    print(f"Acesse na rede local: http://{local_ip}:{PORT}")
    print("\nColoque os arquivos que deseja compartilhar dentro desta pasta e envie o link de rede local.")
    print("Para acesso externo, use um serviço de tunelamento como ngrok ou hospede o arquivo em nuvem.")
    with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
        print(f"Servidor iniciado na porta {PORT}. Ctrl+C para parar.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor encerrado.")
