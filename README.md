# 📱 PWA Playground

Um laboratório de **Progressive Web App** construído para testar, na prática, até onde a web consegue chegar perto de um app nativo — câmera, GPS, biometria, NFC, Bluetooth e muito mais, tudo rodando no browser.

Feito com **Next.js 16**, **React 19** e **Tailwind CSS 4**.

---

## 🚀 Rodando o projeto

```bash
npm install
npm run dev        # desenvolvimento → http://localhost:3000
```

```bash
npm run build      # build de produção
npm start          # serve o build
```

Ou via Docker:

```bash
docker compose up --build
```

> **⚠️ Importante:** quase todas as APIs deste app (câmera, biometria, Bluetooth…) exigem **contexto seguro** — ou seja, `localhost` ou HTTPS. Para testar no celular, use um túnel:
>
> ```bash
> npx ngrok http 3000
> ```

---

## 🗺️ Estrutura do app

A navegação é uma barra inferior fixa (estilo app nativo) com 5 abas:

| Aba | Rota | O que faz |
|---|---|---|
| 📷 **Câmera** | `/camera` | Viewfinder ao vivo, captura de fotos e upload da galeria |
| 🔔 **Avisos** | `/notifications` | Notificações push/locais |
| 📱 **Dispositivo** | `/device` | Identifica o aparelho + dezenas de informações de hardware |
| 🔒 **Biometria** | `/biometric` | Teste de Face ID / digital / Windows Hello via WebAuthn |
| 🧪 **Labs** | `/labs` | Hub de experimentos — cada API tem sua própria página |

A rota raiz (`/`) redireciona para `/camera`.

---

## 📷 Câmera

**API:** `navigator.mediaDevices.getUserMedia`

- Abre a câmera traseira (`facingMode: "environment"`) num viewfinder quadrado
- Captura frames desenhando o `<video>` num `<canvas>` e exportando como JPEG
- Upload de imagens da galeria via `<input type="file">` + `FileReader`
- Galeria em grade com visualização em tela cheia

## 📱 Dispositivo

A página identifica **o que é o aparelho** usando duas estratégias em cascata:

1. **User-Agent Client Hints** (`navigator.userAgentData.getHighEntropyValues`) — só Chrome/Edge, mas retorna o modelo real (ex: `Pixel 9`, `SM-S928B`)
2. **Parsing do User-Agent string** — fallback universal, com tabela de prefixos que mapeia modelo → marca (`SM-` → Samsung, `moto` → Motorola, `Redmi` → Xiaomi…)

> 🍎 No iPhone, a Apple esconde o modelo exato por privacidade — o melhor que dá pra saber é "iPhone + versão do iOS".

Depois de identificar, exibe **8 seções** de informações:

| Seção | Exemplos | APIs |
|---|---|---|
| Tela & Display | resolução, pixel ratio, gama de cor (sRGB/P3), HDR, taxa de Hz | `screen`, `matchMedia`, `requestAnimationFrame` |
| Sistema | browser, modo PWA, tema claro/escuro, idioma, fuso | `matchMedia`, `Intl` |
| Rede | tipo (4G/WiFi), velocidade, latência, economia de dados | `navigator.connection` |
| Hardware | CPU, RAM, GPU, WebGL, Bluetooth/USB/NFC disponíveis | `hardwareConcurrency`, `deviceMemory`, WebGL `UNMASKED_RENDERER` |
| Input | mouse/touch/caneta, hover, gamepads | `matchMedia(pointer)`, `getGamepads` |
| Energia & Disco | bateria (% + status), armazenamento usado/total | `getBattery`, `storage.estimate` |
| Mídia | nº de câmeras/microfones, codecs (VP9, H.264, AV1…) | `enumerateDevices`, `MediaRecorder.isTypeSupported` |
| Privacidade | Do Not Track, cookies | `navigator.doNotTrack` |

A detecção só roda **ao clicar no botão** — as infos síncronas aparecem na hora, e as assíncronas (bateria, storage, Hz) atualizam sozinhas quando resolvem (`Promise.allSettled`).

## 🔒 Biometria

**API:** WebAuthn (`navigator.credentials`)

Teste de autenticação biométrica **sem servidor e sem login** — o objetivo é só disparar o prompt nativo do sistema:

1. **Primeiro clique** → `credentials.create()` cria uma *passkey* local exigindo autenticador de plataforma (`authenticatorAttachment: "platform"` + `userVerification: "required"`). Isso força Face ID no iPhone, digital no Android, Windows Hello no PC.
2. **Cliques seguintes** → `credentials.get()` dispara a verificação biométrica de verdade.
3. O ID da credencial fica no `localStorage` — dá pra remover e recadastrar.

## ⬇️ Instalação (Add to Home Screen)

Botão "Adicionar à tela inicial" na aba Dispositivo, com comportamento por plataforma:

- **Android/Chrome/Edge** — captura o evento `beforeinstallprompt` (que o browser dispara quando os critérios de instalabilidade são atendidos) e chama `.prompt()` no clique
- **iOS** — não existe API de instalação, então o clique abre um guia visual: *Compartilhar → Adicionar à Tela de Início*
- **Já instalado** — o botão se esconde (detecta `display-mode: standalone` e o evento `appinstalled`)

## 🧪 Labs

Hub de APIs experimentais. Cada card mostra um **indicador verde/cinza** de disponibilidade no browser atual, e clicar leva à página dedicada do experimento:

| Experimento | API | Suporte |
|---|---|---|
| 🛰️ **GPS** | `geolocation.watchPosition` | Universal — rastreia lat/lng/altitude/velocidade em tempo real + link pro Google Maps |
| 🧭 **Bússola** | `DeviceOrientationEvent` | Mobile — orientação do aparelho |
| 📳 **Vibração** | `navigator.vibrate` | Android — padrões de vibração |
| 🔵 **Bluetooth** | `navigator.bluetooth` | Chrome/Edge — escaneia e pareia dispositivos próximos |
| 📡 **NFC** | `NDEFReader` | **Só Chrome Android** — lê e grava tags NFC |
| 🔌 **USB & Serial** | `navigator.usb` / `serial` | Chrome/Edge desktop — conecta hardware via cabo |
| 🎤 **Voz** | `speechSynthesis` / `SpeechRecognition` | Texto-para-fala + ditado em pt-BR |
| 🎨 **Conta-gotas** | `EyeDropper` | Chrome/Edge desktop — captura cor de qualquer pixel da tela |
| 😴 **Inatividade** | `IdleDetector` | Chrome/Edge — detecta usuário ausente após 60s |

Todas as páginas do Labs compartilham o `LabShell` — header com botão de voltar e o nome da API em fonte mono.

---

## 🏗️ Como o PWA funciona por baixo

### Service Worker & Manifest

- **`@ducanh2912/next-pwa`** gera o service worker (Workbox) no build — é ele que permite instalação e funcionamento offline
- **`public/manifest.json`** define nome, ícones (192/512px), `display: standalone` e orientação portrait
- O `layout.tsx` linka o manifest e configura `appleWebApp` para o iOS tratar como app instalável

### Decisões de arquitetura

- **App Router** do Next.js 16 — cada feature é uma rota em `app/`, com páginas finas que só importam o componente de `components/`
- **Tudo client-side** — as APIs de hardware só existem no browser, então os componentes interativos usam `"use client"` e acessam `navigator`/`window` dentro de `useEffect`/handlers (nunca no render, por causa do SSR)
- **`prefetch={false}`** nos links da nav — evita o Next.js pré-carregar todas as rotas de uma vez
- **Detecção on-demand** — APIs sensíveis (biometria, identificação) só rodam ao clicar, nada automático
- **Degradação graciosa** — toda API tem check de suporte antes de usar; quando não disponível, mostra mensagem clara em vez de quebrar

### Estrutura de pastas

```
app/
├── camera/            # 📷 captura de fotos
├── notifications/     # 🔔 push notifications
├── device/            # 📱 identificação + specs
├── biometric/         # 🔒 WebAuthn
├── labs/              # 🧪 hub de experimentos
│   ├── gps/ compass/ vibration/
│   ├── bluetooth/ nfc/ usb/
│   └── speech/ eyedropper/ idle/
├── layout.tsx         # root layout + manifest + BottomNav
└── page.tsx           # redirect → /camera

components/
├── BottomNav.tsx      # navegação inferior fixa
├── CameraCapture.tsx
├── DeviceInfo.tsx
├── BiometricTest.tsx
├── InstallButton.tsx
├── GpsTracker.tsx / Compass.tsx / VibrationTester.tsx
├── PushNotifications.tsx
└── labs/LabShell.tsx  # header compartilhado dos experimentos
```

---

## 🧰 Stack

| | |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, webpack) |
| UI | [React 19](https://react.dev) + [Tailwind CSS 4](https://tailwindcss.com) |
| PWA | [@ducanh2912/next-pwa](https://github.com/DuCanhGH/next-pwa) (Workbox) |
| Linguagem | TypeScript 5 |
| Deploy | Docker multi-stage (`output: standalone`) |

---

## 📋 Tabela rápida de compatibilidade

| Funcionalidade | Chrome Android | Safari iOS | Chrome Desktop | Firefox |
|---|:---:|:---:|:---:|:---:|
| Câmera / GPS | ✅ | ✅ | ✅ | ✅ |
| Instalação (prompt) | ✅ | 🟡 manual | ✅ | ❌ |
| Biometria (WebAuthn) | ✅ | ✅ | ✅ | ✅ |
| Vibração | ✅ | ❌ | ❌ | ✅ |
| Bluetooth | ✅ | ❌ | ✅ | ❌ |
| NFC | ✅ | ❌ | ❌ | ❌ |
| USB / Serial | ❌ | ❌ | ✅ | ❌ |
| Conta-gotas | ❌ | ❌ | ✅ | ❌ |
| Inatividade | ✅ | ❌ | ✅ | ❌ |
| Voz (síntese) | ✅ | ✅ | ✅ | ✅ |
| Voz (ditado) | ✅ | 🟡 | ✅ | ❌ |

✅ funciona · 🟡 parcial · ❌ não suportado
