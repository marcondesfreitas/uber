# SYSTEM DESIGN — App do Motorista
### Especificação para protótipos de alta fidelidade interativos (Claude Design)

> **Origem:** engenharia reversa do vídeo `WhatsApp Video 2026-08-25 at 10.08.02.mp4`
> (3 min 16 s, gravação de tela 384×848, tour completo do Uber Driver pt-BR, região Fortaleza/CE).
> **Projeto:** clone didático em React Native + Expo — ver `ROADMAP.md`, `MODULO-01.md`, `MODULO-1.5-DEMANDA.md`.
> **Uso deste arquivo:** é o *briefing único* do Claude Design. Cada seção 8 traz um prompt pronto por tela.

⚠️ **Nota de marca:** o protótipo é um **clone didático**, não uma cópia do produto Uber.
Não usar o logotipo, o wordmark nem o nome "Uber" na UI. Nome de trabalho sugerido: **Rota** (ou o que você preferir).
Onde o vídeo mostra "Uber Pro", "Uber Flash", "Uber Conta", use os equivalentes genéricos da tabela §7.4.

---

## 1. O que o vídeo mostra (inventário bruto)

| # | ~t | Tela | Observações |
|---|----|------|-------------|
| 1 | 0:00 | Splash | Fundo preto puro, logo centralizado, sem texto |
| 2 | 0:06 | **Home offline** | Card "Fortaleza: ganhos altos hoje" + mini-mapa de calor + CTA azul "Ficar online" + tab bar |
| 3 | 0:12 | **Menu** | Avatar + nome + nota 5,00 · Indicações, Descubra, Pro, Carteira, Conta / Ajuda, Informações |
| 4 | 0:24 | **Editar perfil** | Foto (Escolher/Remover) + 8 campos + Salvar / Redefinir |
| 5 | 0:48 | **Gerenciar veículos** | "Qual veículo ficará ativo?" → cards Carro / Moto (rádio) + Modelo, Placa, Cor + CTA |
| 6 | 1:00 | Home | volta pela tab bar |
| 7 | 1:24 | **Perfil público** | Header com gradiente laranja, avatar em máscara orgânica, CTA branco, lista de atributos |
| 8 | 1:36 | **Conta** | 11 linhas de navegação com ícone + chevron; primeira linha com subtítulo (veículo ativo) |
| 9 | 1:48 | **Conta — dados pessoais** | Modal full-screen com tabs roláveis + linhas com valor e selo ✅ verificado |
| 10 | 2:12 | **Ganhos** | Card da semana (R$ 0,00 + barras S T Q Q S S D) + 3 métricas + Carteira |
| 11 | 2:24 | **Preferências** | 4 cards de tipo de serviço (checkbox + badge "↗ Demanda") + toggles de filtro |
| 12 | 2:48 | **Ficando online…** | Tela clara (!), spinner azul, título + subtítulo |
| 13 | 2:54 | **Online / mapa** | Mapa de calor, pills de ETA, badges +R$, barra inferior "Você está online" com progresso |
| 14 | 3:06 | **Solicitação de corrida** | Bottom sheet branco: tipo, R$ 9,72, R$/km, 3 chips, retirada/destino, "Toque no cartão para aceitar" |
| 15 | 3:14 | Home | fim do tour |

**Leitura de produto:** o app tem **dois mundos visuais** — o *mundo de gestão* (escuro, denso, listas e formulários) e o *mundo de direção* (mapa em tela cheia + uma superfície clara flutuante). A troca de tema entre eles é intencional: a tela clara sinaliza "agora é o momento operacional". O protótipo precisa reproduzir isso.

---

## 2. Fundamentos

### 2.1 Grid e tela
- Artboard: **390 × 844** (iPhone 14 / referência do vídeo era 384×848).
- Margem lateral padrão: **16 px**. Cards internos: padding **16 px**.
- Safe area topo: 54 px (status bar + dynamic island). Tab bar: **56 px** + 20 px de home indicator.
- Escala de espaçamento (4 px): `4 · 8 · 12 · 16 · 24 · 32 · 48`.

### 2.2 Cores (tokens)

Base já existente no projeto (`src/theme/cores.js`) — mantida e **estendida**:

```
/* Superfícies escuras */
--fundo            #0B0B0F   fundo de app
--superficie       #17171C   cards, linhas
--superficie-alta  #22222A   campos de formulário, chips
--borda            #2C2C35   1 px, hairline

/* Texto */
--texto            #FFFFFF
--texto-secundario #A0A0AB
--texto-terciario  #6B6B76   labels desabilitadas

/* Ação */
--acao             #3E6FF0   azul do CTA "Ficar online" e dos links
--acao-pressed     #2F58C4
--acao-suave       rgba(62,111,240,0.14)

/* Estado */
--online           #1FD65F   valor em R$, selos verificados
--alerta           #FFB020
--erro             #FF4D4F

/* Superfícies claras (mundo de direção) */
--claro-fundo      #F5F5F7
--claro-superficie #FFFFFF
--claro-texto      #0B0B0F
--claro-texto-sec  #5A5A66
```

**Rampa de demanda (heatmap)** — é a assinatura visual do app; usar sempre nesta ordem:

```
nível 0  transparente
nível 1  #F2B33D  20% opac.   (1,0–1,2x)
nível 2  #E8873A  28%         (1,2–1,5x)
nível 3  #D9484B  34%         (1,5–2,0x)
nível 4  #A8327D  40%         (2,0–2,5x)
nível 5  #6E2BB5  46%         (2,5–3,0x)
```

Badges de bônus (`+R$ 15`) usam `#7B2FBE` com texto branco.
Pills de ETA (`↗ 1-4 min`) usam a cor do nível da célula em 100% de opacidade, texto branco.

### 2.3 Tipografia

Família: **Inter** (ou SF Pro / Roboto no device). No protótipo HTML: `Inter, system-ui, sans-serif`.

| Token | Tam/Peso/Entrelinha | Uso |
|---|---|---|
| `display` | 34 / 800 / 40 | Valor da corrida (R$ 9,72) |
| `h1` | 26 / 800 / 32 | "Fortaleza: ganhos altos hoje", "Conta", "Ganhos" |
| `h2` | 20 / 700 / 26 | Títulos de seção, valor da semana |
| `h3` | 17 / 700 / 22 | Título de linha de lista, header de tela |
| `corpo` | 15 / 400 / 21 | Texto descritivo |
| `corpo-forte` | 15 / 600 / 21 | Rótulos de campo, itens de menu |
| `legenda` | 13 / 500 / 18 | Subtítulos, valores de linha |
| `micro` | 11 / 600 / 14 | Tab bar, pills, badges |

Números monetários sempre com **tabular-nums** e formato pt-BR (`R$ 9,72`, vírgula decimal, ponto de milhar).

### 2.4 Raio, elevação, motion

- Raio: campos e chips `10`; cards `14`; bottom sheet `20` (só topo); botões `28` (pill); avatar `999`.
- Sombra (só no mundo claro sobre mapa): `0 -8px 32px rgba(0,0,0,.28)`.
- No escuro, profundidade vem de **camada de cor**, não de sombra.
- Motion: `rápido 160 ms`, `padrão 240 ms`, `entrada de sheet 320 ms`, curva `cubic-bezier(.22,1,.36,1)`.
- Pulso do botão online: escala 1 → 1,18, opacidade .45 → 0, loop 1600 ms.

---

## 3. Componentes (biblioteca do protótipo)

| Componente | Anatomia | Estados |
|---|---|---|
| `TabBar` | 5 itens: Página inicial, Descubra, Ganhos, Mensagens, Menu — ícone 22 px + label `micro` | ativo (branco) / inativo (`--texto-secundario`) / com badge |
| `AppBar` | ← 24 px · título `h3` centralizado · ação opcional à direita | padrão / com X (modal) / transparente sobre mapa |
| `ListRow` | ícone 22 · título `corpo-forte` · subtítulo `legenda` opcional · chevron | padrão / pressed (`--superficie-alta`) / destrutivo |
| `Field` | label `corpo-forte` acima · input `--superficie-alta`, altura 48, raio 10 | vazio / preenchido / foco (borda `--acao`) / erro / desabilitado |
| `ButtonPrimary` | pill, altura 52, `--acao`, texto 17/700 | normal / pressed (escala .97) / loading / desabilitado (40% opac.) |
| `ButtonGhost` | pill, `--superficie-alta`, texto branco | idem |
| `SelectCard` | card 168×132, borda 1,5 px, ícone/ilustração 3D, título, rádio no canto | selecionado (borda branca) / não / com badge "↗ Demanda" |
| `Toggle` | trilho 52×32 | on (`--acao`) / off (`--superficie-alta`) |
| `Chip` | pill 32 px, `--superficie-alta`, ícone 14 + texto `micro` | informativo / positivo / bônus (roxo) |
| `MetricRow` | 3 colunas: ícone + valor + rótulo | — |
| `WeekBars` | 7 barras + letras S T Q Q S S D | vazia (tracejado azul) / com dados / hoje destacado |
| `HeatCell` | polígono da grade com cor de nível | níveis 0–5 |
| `EtaPill` | pill flutuante sobre o mapa: `↗ 1-4 min` | por nível |
| `BonusBadge` | pill roxo `+R$ 15` | — |
| `MapPuck` | círculo branco 44 px com seta, halo pulsante | seguindo / livre |
| `StatusBarOnline` | barra inferior escura: filtros · "Você está online" + progresso · menu | procurando / a caminho / em viagem |
| `RideRequestSheet` | sheet claro: tipo, valor, R$/km, chips, timeline retirada→destino, hint | entrando / contando / aceito / expirado |
| `CountdownRing` | anel de 12 s ao redor do valor ou borda superior do sheet | — |

---

## 4. Mapa de navegação

```
Splash
 └─ Home (offline) ──────── tab bar ──── Descubra · Ganhos · Mensagens · Menu
      │                                                            │
      ├─ [Ficar online] → Ficando online… → Online/Mapa            │
      │                                        │                   │
      │                                        ├─ Solicitação (sheet)
      │                                        │     ├─ Aceitar → Indo buscar → Aguardando
      │                                        │     │              → Em viagem → Finalizada → Resumo
      │                                        │     └─ Recusar/expirar → volta a Procurando
      │                                        └─ [X] Ficar offline → Home
      │
      └─ Menu ──┬─ Perfil público ── ✎ ─ Editar perfil
                ├─ Conta ──┬─ Veículos → Gerenciar veículos
                │          ├─ Gerenciar conta → Conta (modal, 4 tabs)
                │          └─ Configurações · Documentos · Privacidade · Seguro …
                ├─ Carteira
                ├─ Indicações · Descubra · Pro
                └─ Ajuda · Informações
```

**Máquina de estados da corrida** (usar exatamente estes nomes, alinhados ao `ROADMAP.md` Módulo 2):

`ociosa → recebida → indo_buscar → aguardando → em_viagem → finalizada → ociosa`

---

## 5. Especificação tela a tela

### 5.1 Splash
Fundo `#000`. Logo 48 px centralizado, fade-in 400 ms + escala 0,92→1. Duração 1,2 s → Home.

### 5.2 Home (offline) — *tela âncora*
1. **Topo direito:** dois botões circulares 40 px em `--superficie-alta`: escudo (segurança, ícone azul) e sliders (preferências).
2. **Título** `h1` em duas linhas: `Fortaleza:` / `ganhos altos hoje`. Subtítulo `corpo` em `--texto-secundario`: "Agora será um bom momento para dirigir, a demanda está alta no momento."
3. **Mini-mapa** 358×250, raio 14, mapa escuro com heatmap, contém: botão expandir ↗ (canto sup. esq.), botão busca 🔍 (canto sup. dir.), `MapPuck` central, 1 `EtaPill` vermelha, 2 `BonusBadge`.
4. **"Oportunidades"** `h2` + botão circular `›`.
5. **"Ganhos"** com ícone de barras + "Tendências de ganhos para viagens em Fortaleza" + gráfico de barras horizontal com a barra "agora" em amarelo.
6. **CTA flutuante** `Ficar online` pill azul, 52 px, ícone de volante, ancorado 12 px acima da tab bar, com blur atrás.
7. **TabBar.**

Interações a prototipar: scroll vertical, CTA → 5.11, botão sliders → 5.10, tabs.

### 5.3 Menu (drawer/tab)
Header: avatar 56 px com badge de diamante azul (nível Pro) + nome `h2` + ⭐ 5,00.
Lista sem ícones, `corpo-forte`, altura 44: **Indicações, Descubra, Pro, Carteira, Conta** — divisor 1 px — **Ajuda, Informações**.
Toque em avatar/nome → Perfil público. "Conta" → 5.6.

### 5.4 Perfil público
- AppBar transparente com ← e ✎ (→ Editar perfil).
- Bloco de gradiente radial laranja (`#F5A524` → `#8A4B0F` → transparente), altura 420.
- Avatar 120 px em **máscara orgânica** (blob), borda clara.
- Nome `h2` centralizado; abaixo, CTA branco pill "Saiba mais sobre Pro" com texto `--acao`.
- Lista de atributos com emoji/ícone 20 px: `"Simpático e educado"` · `Fala inglês e espanhol` · `De Belo Horizonte` · `0 viagens em 0 anos`.

### 5.5 Editar perfil
Header `Editar perfil` (`h3`, centralizado, ← à esquerda).
Card de foto: avatar 56 + `ButtonPrimary` claro "Escolher foto" + `ButtonGhost` "Remover".
Campos (`Field`, na ordem): **Nome · Nota (read-only) · E-mail · Gênero · Número de telefone · Idioma · Texto do perfil público · Cidade do perfil público**.
Rodapé: `Salvar` (branco, texto escuro) e `Redefinir` (ghost).
Estados a prototipar: foco, validação de e-mail, salvar → toast "Perfil atualizado".

### 5.6 Conta
`AppBar` só com ←. Título `Conta` `h1` alinhado à esquerda.
Linhas (`ListRow` com ícone + chevron):
`Veículos` *(subtítulo: VOLKSWAGEN VOYAGE 1.0 HNS2665)* · `Portal de oportunidades` · `Documentos` · `Repasse de ganhos` · `Informações fiscais` · `Gerenciar conta` · `Edite o endereço` · `Seguro` · `Privacidade` · `Configurações do app` · `Sobre`.

### 5.7 Conta (modal) — dados pessoais
Modal full-screen, header com **X** + título `Conta`.
Tabs roláveis horizontalmente: `Página inicial · Dados pessoais · Segurança · Privacidade e dados` — indicador branco 2 px sob a ativa.
Avatar 80 px. Linhas `título / valor` com chevron: **Nome, Gênero, Número de telefone ✅, E-mail ✅, Idioma ↗**.
Selo verificado: círculo verde 16 px com ✓.

### 5.8 Gerenciar veículos
Header `Gerenciar veículos`. Pergunta `h2`: "Qual veículo ficará ativo?".
Dois `SelectCard` lado a lado com render 3D: **Carro** (selecionado, borda branca + ✓) e **Moto**.
Campos: `Modelo` · `Placa` · `Cor`.
CTA branco: **Salvar e usar este veículo** → toast + volta para Conta com subtítulo atualizado.

### 5.9 Ganhos
Link `? Ajuda` no topo direito. Título `Ganhos` `h1`.
**Card da semana:** período `17 de ago. – 23 de ago.` · valor `R$ 0,00` em `h1` · à direita `WeekBars` (estado vazio = 7 tracejados azuis + letras S T Q Q S S D) · linha de 3 métricas com ícones: `0 h online` · `0 viagens` · `0 pontos` · `ButtonGhost` "Mais informações".
**Carteira:** card com "Conta" + "Você recebe um repasse automático após cada viagem" + `ButtonGhost` "Ver detalhes".
Prototipar também a versão **com dados** (semana de R$ 842,30, barras preenchidas, dia atual destacado) — é o Módulo 4 do roadmap.

### 5.10 Preferências
Header `Preferências`. Banner âmbar (`rgba(255,176,32,.14)`, texto `#F5C77E`): "Filtrar viagens com base nas preferências".
Seção `Opções` + `ButtonGhost` pequeno "Saiba mais".
Grade 2×2 de `SelectCard` com checkbox: **Entregas · Viagens · Envios · Standard** (o vídeo mostra dois conjuntos, com scroll horizontal/paginado). Badge verde `↗ Demanda` no canto superior esquerdo dos cards com alta demanda.
Seção `Filtros da viagem` com `Toggle`: **Trocas de viagens** (com subtítulo) · **Aceitar dinheiro** · **Avaliação do usuário** (com subtítulo).

### 5.11 Ficando online… *(mundo claro)*
Fundo `--claro-fundo`. **X** circular no topo esquerdo. Anel de progresso indeterminado 72 px em `--acao`, girando 900 ms/volta. Título `h2` escuro "Ficando online…" + `corpo` "Preparando o mapa e procurando viagens.". Duração simulada: 2 s → 5.12.

### 5.12 Online / mapa *(tela mais importante)*
- Mapa escuro em tela cheia com **camada de demanda** (grade de células, rampa §2.2), rótulos de bairros e POIs.
- Topo: botão circular 🏠 (esquerda), **pill de ganhos** central `R$ 0,00` com cifrão verde, 🔍 (direita).
- Sobre o mapa: 6 `EtaPill` no máximo (regra de performance do Módulo 1.5: nunca mais que 6 rótulos), 2 `BonusBadge`.
- Coluna direita de botões circulares: escudo de segurança, ícone de zona quente 🔥, gráfico de demanda, bússola/recentrar.
- `MapPuck` central com halo.
- **Barra inferior** (`StatusBarOnline`, altura 92, `--superficie` com raio 20 no topo): à esquerda ícone de filtros, ao centro `Você está online` + barra de progresso azul animada (indica busca), à direita ☰.
- Toque numa célula → `PainelZona` (card deslizante já especificado no Módulo 1.5: pedidos, motoristas, pedidos/carro, ganho estimado, multiplicador).

### 5.13 Solicitação de corrida *(o momento de maior tensão da UI)*
Bottom sheet **claro** (`--claro-superficie`), raio 20 no topo, entra de baixo em 320 ms com overshoot leve + vibração + som.
Conteúdo:
1. Linha superior: `Chip` com ícone e nome do serviço (ex.: `Standard+`) à esquerda, **X** circular à direita.
2. **Valor** `display`: `R$ 9,72`.
3. `legenda`: `R$ 0,98/km aprox.`
4. Fileira de 3 chips: `⭐ 4,90 (386)` · `● Verificado` · `⚡ +R$ 1,01 incluído`.
5. **Timeline** com dois pontos ligados por linha vertical:
   - `4 min (2,3 km)` / `Rua Padre Valdevino, 2100 - Joaquim Távora, Fortaleza - CE`
   - `5 minutos (3,8 km)` / `Av. Senador Virgílio Távora, 900 - Dionísio Torres, Fortaleza - CE`
6. Rodapé centralizado `legenda`: **Toque no cartão para aceitar**.
7. **Contagem regressiva** de 12 s: barra/anel no topo do sheet consumindo da direita para a esquerda; nos últimos 3 s a cor vai para `--erro` e o pulso acelera.
No mapa acima: rota traçada em branco entre o puck (azul, motorista) e o pin de retirada (quadrado escuro em círculo).
Ações: tocar no card → `indo_buscar`; X ou fim da contagem → volta a `Procurando`, com toast "Viagem recusada".

### 5.14 Telas a criar (não estão no vídeo, mas o fluxo exige)
- **Indo buscar:** rota até o passageiro, sheet compacto com nome, nota, botões `Navegar`, `Mensagem`, `Ligar`, `Cancelar`.
- **Aguardando passageiro:** cronômetro de espera, botão "Iniciar viagem" (deslizar para confirmar).
- **Em viagem:** rota até o destino, ganho parcial, botão "Finalizar viagem".
- **Resumo da corrida:** valor, distância, tempo, avaliação do passageiro em 5 estrelas, gorjeta.
- **Estados vazios/erro:** sem GPS, sem internet, permissão negada, nenhuma viagem por perto.

---

## 6. Microinterações obrigatórias no protótipo

1. **Pulso do botão online** (Home) — anel expandindo em loop.
2. **Transição escuro → claro** ao ficar online: crossfade 240 ms, não corte seco.
3. **Sheet da solicitação:** slide-up com overshoot + haptic + som curto.
4. **Contagem regressiva** com mudança de cor nos últimos 3 s.
5. **Heatmap respirando:** opacidade das células oscila ±4% a cada 4 s (simula o tick de 4 s do simulador do Módulo 1.5).
6. **Puck orientado:** a seta gira com o `heading`.
7. **Pressed state** em toda linha e botão (escala .97 / cor de superfície).
8. **Toast** padrão: pill escuro, 240 ms de entrada, 2,4 s de permanência.
9. **Skeleton** nas listas de ganhos e histórico.

---

## 7. Regras de conteúdo

### 7.1 Dados mock (usar consistentemente em todas as telas)

```json
{
  "motorista": { "nome": "Luciano", "nota": 5.00, "cidade": "Belo Horizonte",
                 "bio": "Simpático e educado", "idiomas": ["Português","Inglês","Espanhol"],
                 "viagens": 0, "anos": 0, "nivel": "Pro Azul" },
  "veiculo": { "tipo": "carro", "modelo": "VOLKSWAGEN VOYAGE 1.0", "placa": "HNS2665", "cor": "PRETA" },
  "cidade_operacao": "Fortaleza - CE",
  "semana": { "periodo": "17 de ago. – 23 de ago.", "valor": 0, "horas": 0, "viagens": 0, "pontos": 0 },
  "corrida_exemplo": {
    "servico": "Standard+", "valor": 9.72, "por_km": 0.98,
    "passageiro": { "nota": 4.90, "avaliacoes": 386, "verificado": true },
    "bonus": 1.01,
    "retirada": { "eta": "4 min", "dist": "2,3 km", "end": "Rua Padre Valdevino, 2100 - Joaquim Távora, Fortaleza - CE" },
    "destino":  { "eta": "5 minutos", "dist": "3,8 km", "end": "Av. Senador Virgílio Távora, 900 - Dionísio Torres, Fortaleza - CE" }
  }
}
```

### 7.2 Idioma e formato
Tudo em **pt-BR**. Moeda `R$ 0,00`. Distância `2,3 km`. Tempo `4 min`. Datas `17 de ago.`.

### 7.3 Tom de voz
Direto e operacional, segunda pessoa: "Você está online", "Toque no cartão para aceitar", "Preparando o mapa e procurando viagens."

### 7.4 Renomeações de marca

| No vídeo | No protótipo |
|---|---|
| Uber Pro | **Pro** |
| Uber Flash / Flash+ | **Standard / Standard+** |
| Uber Moto | **Moto** |
| Uber Envios | **Envios** |
| Uber Conta / Conta da Uber | **Conta** |
| Gerenciar conta da Uber | **Gerenciar conta** |

---

## 8. Prompts prontos para o Claude Design

Cada bloco gera um artboard de 390×844. Rodar na ordem — o primeiro estabelece os tokens.

**P0 — Fundação**
> Crie um canvas de design mobile 390×844, tema escuro, com os design tokens da seção 2 deste documento (cores, tipografia Inter, escala de 4 px, raios, motion). Gere primeiro uma artboard "Design System" mostrando a paleta, a rampa de demanda de 6 níveis, a escala tipográfica e os componentes base: TabBar, AppBar, ListRow, Field, ButtonPrimary, ButtonGhost, SelectCard, Toggle, Chip, EtaPill, BonusBadge.

**P1 — Home offline** → seção 5.2, com o mini-mapa de calor e o CTA azul flutuante.
**P2 — Menu + Perfil público** → 5.3 e 5.4 (gradiente laranja, avatar em blob).
**P3 — Editar perfil + Gerenciar veículos** → 5.5 e 5.8, com estados de foco e seleção.
**P4 — Conta + modal de dados pessoais** → 5.6 e 5.7, com tabs e selos verificados.
**P5 — Ganhos** → 5.9, em duas versões: semana vazia e semana com R$ 842,30.
**P6 — Preferências** → 5.10, com badges de demanda e toggles.
**P7 — Ficando online** → 5.11, tema claro, spinner.
**P8 — Online/mapa** → 5.12, heatmap com 6 níveis, pills de ETA, barra de status inferior. **A tela mais importante: capriche na camada de demanda.**
**P9 — Solicitação de corrida** → 5.13, sheet claro sobre o mapa, com anel de contagem regressiva animado.
**P10 — Fluxo completo da corrida** → 5.14, quatro artboards: indo buscar, aguardando, em viagem, resumo.
**P11 — Estados** → vazio, erro, offline, permissão de GPS negada.

**Regra para todos:** as artboards devem ser **interativas** — botões navegam entre artboards, toggles alternam, o CTA "Ficar online" leva a P7→P8, e o sheet de P9 sobe com animação.

---

## 9. Acessibilidade (checar antes de fechar o protótipo)

- Contraste mínimo 4,5:1 para texto; `--texto-secundario` sobre `--superficie` passa — validar qualquer cor nova.
- Alvo de toque mínimo 44×44 px (as pills sobre o mapa são decorativas, mas os botões circulares não).
- A cor **nunca** é o único sinal: o nível de demanda também aparece como número (`2.1x`) e a corrida verificada tem texto além do ícone.
- Respeitar `prefers-reduced-motion`: desligar pulso, respiração do heatmap e overshoot.
- Rótulos de leitor de tela em todo ícone-botão.

---

## 10. Rastreabilidade com o roadmap

| Módulo | Telas deste documento |
|---|---|
| 1 — Mapa e botão online | 5.11, 5.12 (base), MapPuck, StatusBarOnline |
| 1.5 — Demanda e surge | 5.12 (camada + PainelZona), rampa §2.2, EtaPill |
| 2 — Fluxo da corrida | 5.13, 5.14, máquina de estados §4 |
| 3 — Verificação facial | *(a especificar)* — instrução → captura → conferindo → aprovado |
| 4 — Ganhos e gráficos | 5.9 (versão com dados), WeekBars, histórico |
| 5 — Polimento | §6 microinterações, §9 acessibilidade, estados de erro |
