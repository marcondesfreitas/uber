# Roadmap — App do Motorista (clone didático do Uber Driver)

**Stack:** React Native + Expo (JavaScript) · dados simulados no aparelho
**Objetivo:** aprender programação móvel construindo um app de verdade.

Legenda: ✅ pronto · 🔜 próximo · ⬜ planejado

---

## ✅ Módulo 1 — Mapa, GPS e o botão "Ficar Online"
Mapa em tema escuro, localização em tempo real, marcador que gira com a
direção, painel de status, botão com animação de pulso.
**Aprende:** permissões em runtime, ciclo de vida de assinaturas do GPS, câmera
do mapa (zoom/pitch), `Animated` com driver nativo, design tokens.
📄 `MODULO-01.md`

## ✅ Módulo 1.5 — Zonas de demanda e preço dinâmico
Grade de células, simulação de oferta e demanda, algoritmo de surge com
suavização e teto, camada colorida no mapa, card da zona, dica de para onde ir.
**Aprende:** geometria em lat/lng, sistemas com realimentação, EMA, performance
com muitos objetos no mapa, ética de precificação.
📄 `MODULO-1.5-DEMANDA.md`

## 🔜 Módulo 2 — Navegação e o fluxo da corrida
- React Navigation (stack + tabs) e arquitetura de pastas para crescer
- Solicitação de corrida chegando: bottom sheet subindo, **contagem regressiva
  animada**, som de alerta (`expo-av`) e vibração (`expo-haptics`)
- Aceitar / recusar, e a máquina de estados da corrida
  (`ociosa → recebida → indo_buscar → aguardando → em_viagem → finalizada`)
- Rota com `<Polyline>` e `fitToCoordinates` para enquadrar os dois pontos
**Aprende:** navegação, gestos, som, háptica, máquina de estados — o conceito
que evita que o app vire um emaranhado de `if`.

## ⬜ Módulo 3 — Verificação facial com a câmera
- `expo-camera` com a câmera frontal, overlay com máscara oval animada
- Detecção de rosto e prova de vida simples ("pisque", "vire a cabeça")
- Fluxo completo: instrução → captura → conferindo (animação) → aprovado
**Aprende:** permissões de câmera, preview em tempo real, overlays com
`Animated`, e por que verificação facial é um tema sensível (viés algorítmico,
LGPD, dados biométricos — outro bom capítulo de TCC).

## ⬜ Módulo 4 — Ganhos, histórico e gráficos
- Tela de ganhos com gráfico de barras por dia e resumo semanal
- Histórico de corridas com lista performática (`FlatList`), skeleton loading
- Meta diária com anel de progresso animado
**Aprende:** listas grandes, formatação de moeda/data em pt-BR, animação de
valores numéricos, componentes de gráfico do zero com SVG.

## ⬜ Módulo 5 — Polimento: o que separa protótipo de app
- Tema claro/escuro com Context + persistência (`AsyncStorage`)
- Estados de erro, offline e vazio (o que 90% dos projetos de faculdade esquecem)
- Acessibilidade: labels, contraste, `reduceMotion`
- Ícone, splash screen e build com EAS para instalar no celular sem Expo Go
**Aprende:** o acabamento que faz diferença numa apresentação.

## ⬜ Módulo 6 (opcional) — Sair do mock
- Backend simples ou Firebase: corridas em tempo real de verdade
- Dois apps conversando (passageiro pede, motorista recebe)
**Aprende:** tempo real, sincronização, e por que o mock foi útil até aqui.

---

### Ideias que ainda podem entrar (me diga se quiser)
- Modo navegação turn-by-turn com instruções faladas (`expo-speech`)
- Rastreamento em segundo plano (`expo-task-manager`) com a corrida em andamento
- Chat com o passageiro e ligação mascarada
- Gamificação: níveis, missões ("faça 10 corridas e ganhe R$ 50")
- Testes automatizados com Jest + React Native Testing Library
