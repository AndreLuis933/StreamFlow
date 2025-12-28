# 🎬 StreamFlow

## ✨ Sobre o Projeto

Este projeto é uma **plataforma de streaming própria (POC)** que demonstra de ponta a ponta a construção de um serviço de vídeo sob demanda, pensado como **projeto de portfólio** com foco em:

- Entregar uma **experiência de reprodução fluida** com player HLS moderno,
- Implementar **detecção automática de intro/créditos** via análise de áudio,
- Operar **100% em free tier ou baixo custo** (AWS, Cloudflare, Firebase, Vercel),
- Oferecer **autenticação, favoritos e acompanhamento de conteúdo**.

A arquitetura foi desenhada para ser **barata, escalável e funcional**, com proxy de vídeo na borda, backend serverless de análise de mídia e cache inteligente de resultados.

Todo o conteúdo de vídeo é **próprio do projeto**: montagens produzidas a partir de **áudio e vídeo obtidos no Pixabay**, com tema central em **natureza**.

**[🚀 Veja a demo online aqui!](https://stream-flow-dev.vercel.app/)**

---

## 🚀 Tecnologias Utilizadas

| Categoria             | Tecnologia(s)                                               |
| :-------------------- | :--------------------------------------------------------- |
| **Front-end**         | React, TypeScript, MUI, Emotion/styled                     |
| **Player**            | Plyr, HLS.js                                               |
| **Roteamento**        | React Router DOM                                           |
| **Proxy de Vídeo**    | Cloudflare Workers (TypeScript)                            |
| **Backend (Áudio)**   | AWS Lambda (Python), `av` (FFmpeg), NumPy, STFT            |
| **Origem de Vídeo**   | AWS S3                                                     |
| **Banco / Cache**     | Firebase/Firestore                                         |
| **Hospedagem Front**  | Vercel                                                     |

---

## ⚙️ Como Funciona (Visão Geral)

O sistema é dividido em três blocos principais que trabalham em conjunto:

### 1. Front-end Interativo (SPA em React + TypeScript)

- **Interface moderna** construída com **React, TypeScript e MUI**, com estilização via **Emotion/styled**.
- **Autenticação com Google**:
  - Login social,
  - Sincronização de perfil e preferências.
- **Favoritos e acompanhamento**:
  - Marcar séries/vídeos favoritos,
  - Acompanhar novos lançamentos,
  - Dados salvos no **Firestore** vinculados à conta do usuário.
- **Player otimizado**:
  - Integração **Plyr + HLS.js** para streaming adaptativo,
  - Reprodução fluida de vídeos hospedados no **S3** via proxy,
  - Botões **"Pular Intro"** e **"Pular Créditos"** exibidos nos momentos corretos.
- **Navegação SPA**:
  - **React Router DOM** para transições rápidas sem recarregar a página,
  - Rotas públicas (login, feed) e protegidas (player, favoritos).
- **Layout responsivo**:
  - Desktop: grid amplo, múltiplas colunas,
  - Mobile: layout em coluna, componentes compactos.

---

### 2. Proxy de Vídeo Inteligente (Cloudflare Worker)

- Camada intermediária entre o front-end e o **bucket S3** onde os vídeos estão hospedados.
- Escrito em **TypeScript**, executado na **rede de borda da Cloudflare**.
- Responsabilidades:
  - Receber requisições de playlists `.m3u8` e segmentos de vídeo,
  - Encaminhar para o **S3**,
  - Adaptar/reescrever URLs quando necessário,
  - Controlar headers HTTP,
  - Implementar **cache** para playlists e segmentos frequentemente acessados.
- Resultado:
  - Reduz latência para o usuário final,
  - Diminui chamadas diretas ao S3,
  - Ajuda a manter o consumo dentro de limites de custo desejados.

---

### 3. Backend de Detecção de Intro/Créditos (AWS Lambda + Python + S3)

A **AWS Lambda** analisa o áudio dos vídeos armazenados no **S3** para detectar automaticamente **trechos recorrentes** (intros, créditos, vinhetas) com base em fingerprint de áudio.

#### Processo de Análise:

1. **Leitura dos vídeos a partir do S3**:
   - A Lambda acessa diretamente os arquivos de mídia no **S3**,
   - Compara, por exemplo, dois episódios de uma mesma série (atual e referência).

2. **Extração e normalização do áudio**:
   - Carrega o vídeo em memória e extrai somente o stream de áudio via bindings de FFmpeg (`av`),
   - Reamostragem para taxa fixa, conversão para mono, normalização para `float32` no intervalo `[-1, 1]`.

3. **Fingerprint de áudio**:
   - Aplica **STFT** ao sinal para gerar o espectrograma (frequência × tempo),
   - Detecta picos de energia em diferentes janelas,
   - Combina picos próximos no tempo em pares, gerando hashes compactos (`freq1|freq2|Δt`),
   - Resultado: "impressão digital" de cada vídeo, composta por hashes com timestamps associados.

4. **Matching entre vídeos**:
   - Mapeia os hashes do vídeo de referência em "hash → tempos",
   - Para cada hash em comum com o vídeo alvo, calcula o deslocamento de tempo (offset),
   - Histograma de offsets revela o alinhamento temporal mais provável,
   - Clusters contínuos de matches indicam o **trecho idêntico** (intro/créditos/vinheta).

5. **Cálculo de início e duração**:
   - A partir do cluster dominante, determina:
     - Quando começa a intro no episódio atual,
     - Quanto tempo ela dura,
     - Nível de confiança baseado na quantidade e consistência dos matches.

6. **Cache no Firestore**:
   - Timestamps calculados (início/fim de intro/créditos) são salvos no **Firestore**, associados ao vídeo/série/episódio,
   - Em chamadas futuras, a Lambda consulta o Firestore e retorna imediatamente se o resultado já existe, evitando reprocessamento.

---

## 💰 Custos e Escalabilidade

Todo o desenho foi feito para operar **inteiramente dentro dos tiers gratuitos ou de baixo custo** de:

- **Cloudflare** (Workers com cache na borda),
- **AWS** (Lambda sob demanda + S3 para armazenamento de vídeos),
- **Firebase/Firestore** (cache de timestamps e metadados),
- **Vercel** (Front-end).

O uso de **cache na borda (Cloudflare)** e de **processamento sob demanda (Lambda + Firestore como cache de resultados)** ajuda a minimizar acessos diretos ao S3 e reprocessamentos desnecessários.

---

## 📄 Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

### Licença do Conteúdo de Vídeo

Todo o conteúdo de vídeo utilizado neste projeto é composto por **áudio e vídeo obtidos no Pixabay**, sob a **Pixabay Content License**, que permite:

✓ Uso gratuito do conteúdo  
✓ Uso sem necessidade de atribuição (embora sempre apreciado)  
✓ Modificação ou adaptação do conteúdo em novas obras  

**Usos proibidos incluem:**

✕ Venda ou distribuição do conteúdo de forma isolada (sem esforço criativo aplicado)  
✕ Uso comercial de conteúdo com marcas/logos reconhecíveis em produtos físicos  
✕ Uso de forma imoral, ilegal, enganosa ou como parte de marca registrada  

Para mais detalhes, consulte o [resumo completo da licença Pixabay](https://pixabay.com/pt/service/license-summary/).