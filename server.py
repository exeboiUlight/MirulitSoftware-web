# server.py
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = 8000
server_address = ('localhost', PORT)  # или ('127.0.0.1', PORT)

with HTTPServer(server_address, SimpleHTTPRequestHandler) as httpd:
    print(f'Сервер запущен на http://localhost:{PORT}')
    httpd.serve_forever()  # сервер будет работать до прерывания (Ctrl+C)