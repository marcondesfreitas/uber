# Módulo 1 — Mapa, GPS e o botão "Ficar Online"

Projeto: **app de motorista** (clone didático do Uber Driver) em React Native + Expo.
Objetivo deste módulo: ter um app rodando no seu celular que mostra **o mapa em tema escuro**, **sua posição em tempo real** e um **botão animado** que alterna online/offline.

---

## 1. Criar o projeto (você roda no terminal)

Abra o PowerShell **dentro da pasta** `Documents\CLAUDE\PROJETOS\UBER` e rode:

```powershell
npx create-expo-app@latest . --template blank
npx expo install react-native-maps expo-location
```

> Por que não te entreguei o `package.json` pronto? Porque as versões das
> bibliotecas precisam bater com a versão do Expo SDK instalada hoje.
> O `npx expo install` resolve isso automaticamente — é o comando que você deve
> usar **sempre** no lugar de `npm install` para pacotes nativos.

Depois **substitua/adicione** os arquivos que eu deixei na pasta:
`App.js`, `app.json` e a pasta `src/` inteira.

## 2. Rodar

```powershell
npx expo start
```

Instale o app **Expo Go** no celular Android, leia o QR code, e pronto.
(Celular e PC precisam estar no mesmo Wi-Fi. Se não conectar, use `npx expo start --tunnel`.)

⚠️ **iOS:** `PROVIDER_GOOGLE` exige chave de API do Google. No iPhone, remova a
linha `provider={PROVIDER_GOOGLE}` do `MapaScreen.js` para usar o Apple Maps
(mas aí o `customMapStyle` não funciona — o Apple Maps não aceita esse estilo).

---

## 3. Mapa dos arquivos

```
App.js                          ponto de entrada
app.json                        nome, permissões (Android/iOS), tema
src/
  theme/cores.js                paleta, espaçamentos, tipografia e estilo escuro do mapa
  hooks/useLocalizacaoMotorista.js   toda a lógica de GPS isolada num hook
  components/
    BotaoOnline.js              botão com animação de pulso e de toque
    PainelStatus.js             painel superior (só desenha, não pensa)
    MarcadorCarro.js            marcador customizado que gira com a direção
  screens/
    MapaScreen.js               junta tudo: mapa + câmera + estado online
```

## 4. Os 5 conceitos que este módulo ensina

1. **Permissões em tempo de execução.** No Android 6+ e no iOS, declarar a
   permissão no `app.json` não basta: você precisa *pedir* (`requestForegroundPermissionsAsync`)
   e tratar o caso "negado". App que quebra quando o usuário nega é bug clássico.

2. **Assinatura de eventos e limpeza.** `watchPositionAsync` fica ligado ao GPS.
   Se você não chamar `.remove()` no `return` do `useEffect`, o app continua
   consumindo bateria mesmo com a tela fechada. Todo recurso que você *abre*,
   você *fecha*.

3. **Câmera do mapa ≠ região.** `animateCamera` controla centro, `zoom`, `pitch`
   (inclinação 3D) e `heading` (rotação) com animação suave. É o que dá a
   sensação de navegação. Repare que ao arrastar o mapa (`onPanDrag`) desligamos
   o "seguir" — respeitar a intenção do usuário é regra de UX de mapa.

4. **Animated com `useNativeDriver`.** A animação de pulso roda na thread
   nativa: continua a 60fps mesmo se o JavaScript estiver ocupado processando
   uma corrida chegando. Só `transform` e `opacity` aceitam driver nativo.

5. **Design tokens.** Nenhuma cor está escrita solta nos componentes. Tudo vem
   de `theme/cores.js`. Quando formos fazer tema claro, muda um arquivo só.

---

## 5. Exercícios (faça antes do Módulo 2)

1. **Fácil:** mude o app para tema claro criando `coresClaras` e trocando o
   import em um componente. Onde dói mais? Isso mostra por que o próximo passo
   natural é um `ThemeContext`.
2. **Médio:** adicione ao `PainelStatus` um contador de quanto tempo o motorista
   está online (`useEffect` + `setInterval`, e limpe o intervalo!).
3. **Médio:** faça o marcador do carro **deslizar** entre duas posições em vez de
   pular. Dica: `Animated.Region` do react-native-maps, ou interpolar lat/lng
   com `Animated.timing`.
4. **Difícil:** quando ficar online, gire a câmera conforme o `heading` do GPS
   (`animateCamera({ heading: local.heading })`) e veja o mapa girar como num GPS
   de carro. Cuidado com jitter quando a velocidade é zero — por que acontece?

---

## 6. O que vem no Módulo 2

- Navegação entre telas (React Navigation) e arquitetura de pastas para crescer.
- Mock de corridas: uma "solicitação" chega com contagem regressiva animada,
  som de alerta (`expo-av`), vibração (`expo-haptics`) e bottom sheet deslizante.
- Aceitar/recusar, traçar a rota (`Polyline`) e ajustar o mapa aos dois pontos
  (`fitToCoordinates`).

Quando terminar de rodar o Módulo 1, me diga o que apareceu na tela (ou o erro)
que eu sigo para o próximo.
