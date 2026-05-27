# Compartilhar a aplicação via link

Coloque aqui dentro os arquivos que você quer compartilhar com sua equipe, por exemplo:
- app_kts.py.exe
- logo_kts.jpeg
- header_kts.jpeg
- footer_kts.jpeg

## Como usar

1. Abra a pasta `APP`.
2. Execute `start_server.bat` ou `python serve_app.py`.
3. O servidor irá rodar em `http://localhost:8000`.
4. Se alguém estiver na mesma rede local, envie o endereço que aparece como `http://<seu_ip>:8000`.

## Importante

- Isso cria um link **local**. Outras pessoas só conseguem acessar se estiverem na mesma rede ou se o seu computador estiver exposto à internet.
- Para acesso externo via WhatsApp, você precisa:
  - usar um serviço de tunelamento como `ngrok`, ou
  - hospedar o arquivo em um serviço de compartilhamento na nuvem (Google Drive, OneDrive, Dropbox).

### Exemplo de uso com ngrok

1. Instale `ngrok`.
2. Rode o servidor local.
3. Abra `ngrok http 8000`.
4. Envie o link público gerado pelo `ngrok`.
