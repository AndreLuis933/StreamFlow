# 🎬 Projeto de Player de Vídeo Otimizado com Detecção de Intro/Créditos

## ✨ Sobre o Projeto

Este projeto é uma **Single Page Application (SPA)** que oferece uma experiência de reprodução de vídeo superior para conteúdo online. Ele resolve problemas comuns de travamento e melhora a usabilidade ao introduzir funcionalidades como **"Pular Intro"** e **"Pular Créditos"** automáticos, além de gerenciamento de favoritos e acompanhamento de lançamentos.

A aplicação atua como um **proxy inteligente** para o site de vídeos original, otimizando o streaming e adicionando recursos avançados sem modificar a fonte do conteúdo.

**[ 🚀 Veja a demo online aqui! ](https://stream-flow-dev.vercel.app/)**

## 🚀 Tecnologias Utilizadas

| Categoria       | Tecnologia(s)                               |
| :-------------- | :------------------------------------------ |
| **Front-end**   | React, TypeScript, MUI, Emotion/styled      |
| **Player**      | Plyr, HLS.js                                |
| **Roteamento**  | React Router DOM                            |
| **Proxy**       | Cloudflare Workers (TypeScript)             |
| **Backend (Áudio)** | AWS Lambda (Python), `av` (FFmpeg), NumPy |
| **Banco/Cache** | Firebase/Firestore                          |
| **Hospedagem**  | Vercel (Front-end), Cloudflare (Worker), AWS (Lambda) |

## ⚙️ Como Funciona (Visão Geral)

O projeto é dividido em três pilares principais que trabalham em conjunto para entregar a experiência final:

### 1. Front-end Interativo (SPA)

-   **Interface:** Uma aplicação web moderna construída com **React e TypeScript**, utilizando **MUI** para componentes e **Emotion/styled** para estilização responsiva (desktop e mobile).
-   **Autenticação:** Permite **login com Google**, gerenciamento de **animes favoritos** e acompanhamento de **novos lançamentos**.
-   **Player Otimizado:** Integra o player **Plyr** com **HLS.js** para streaming de vídeo adaptativo, garantindo reprodução fluida e sem travamentos.
-   **Navegação:** **React Router DOM** para uma experiência de navegação rápida e sem recarregamento de página.

### 2. Proxy de Vídeo Inteligente (Cloudflare Worker)

-   Atua como uma camada intermediária entre o front-end e o site de vídeos original.
-   Escrito em **TypeScript** e executado na rede de borda da **Cloudflare**.
-   **Função:** Encaminha requisições de vídeo, adiciona headers necessários (como `referer`) e implementa **cache** para otimizar o carregamento e reduzir a carga no servidor de origem.

### 3. Backend de Detecção de Intro/Créditos (AWS Lambda)

-   Uma função **Python** na **AWS Lambda** que analisa o áudio dos vídeos para identificar automaticamente os trechos de intro e créditos.
-   **Processo:**
    1.  **Download em Memória:** Baixa dois episódios (atual e um de referência) via HLS, mantendo tudo na RAM para eficiência.
    2.  **Extração de Áudio:** Utiliza `av` (bindings para FFmpeg) para extrair, decodificar e normalizar o áudio.
    3.  **Fingerprint de Áudio:** Aplica **STFT** e técnicas de **detecção de picos** para gerar uma "impressão digital" única do áudio de cada episódio.
    4.  **Alinhamento e Descoberta:** Compara as impressões digitais de dois episódios para encontrar o trecho de áudio idêntico (a intro ou os créditos).
    5.  **Cache:** Os timestamps de início e fim da intro/créditos são armazenados no **Firebase/Firestore** para acesso rápido em futuras reproduções, evitando reprocessamento.

## 💰 Controle de Custos

Todo o projeto foi arquitetado para operar **integralmente dentro dos tiers gratuitos** das plataformas utilizadas (Vercel, Cloudflare, AWS Lambda, Firebase/Firestore), garantindo escalabilidade sem custos operacionais.