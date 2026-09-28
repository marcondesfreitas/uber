# Módulo 1.5 — Zonas de demanda e preço dinâmico (surge)

> Este módulo não estava no plano original. Você pediu e ele entrou — é a parte
> mais interessante do Uber real e dá um capítulo inteiro de TCC.

Ele é **independente do Módulo 2**: já roda em cima do mapa que você tem.
Não precisa instalar nada novo.

---

## 1. O que o app passa a fazer

- Divide a área ao redor de você numa grade de **81 células de 700 m**.
- A cada 4 segundos simula quantos **passageiros pedindo** e quantos
  **motoristas disponíveis** existem em cada célula.
- Calcula um **multiplicador de preço** por célula e pinta o mapa
  (amarelo → laranja → vermelho).
- Toque numa zona: abre um card deslizante com pedidos, motoristas,
  pedidos por carro e o ganho estimado da corrida.
- Quando você está online, aparece uma faixa: *"Zona a 2.1x por perto"*.
- Botão 🔥 liga/desliga a camada, com legenda.

Arquivos novos:

```
src/data/zonasDemanda.js        grade + simulador de oferta e demanda
src/services/precoDinamico.js   o algoritmo de surge (o cérebro)
src/hooks/useZonasDemanda.js    junta tudo e roda no relógio
src/components/CamadaDemanda.js polígonos e etiquetas sobre o mapa
src/components/PainelZona.js    card animado da zona selecionada
src/components/LegendaDemanda.js botão + legenda
src/screens/MapaScreen.js       (ATUALIZADO — substitua o antigo)
```

---

## 2. O conceito, sem enrolação

Surge pricing é um **sistema de controle com realimentação**, igual a um
termostato. O "sensor" é a razão entre pedidos e motoristas:

```
razão = pedidos ÷ motoristas
multiplicador = razão ^ 0.55     (limitado entre 1.0 e 3.0)
```

Quando o preço sobe, duas coisas acontecem **sozinhas**:

- passageiros sem pressa desistem ou esperam → a demanda cai;
- motoristas se deslocam para a zona cara → a oferta sobe.

O sistema volta ao equilíbrio, o multiplicador cai. Esse é o ciclo inteiro.

### Por que o expoente 0,55?

Se você usasse a razão direta, 4 pedidos por motorista viraria **4,0x** — brutal.
Com o expoente, vira **2,2x**. A curva sobe rápido no início e vai achatando:

| pedidos/motorista | razão direta | com expoente 0,55 |
|---|---|---|
| 1,5 | 1,5x | 1,3x |
| 2,0 | 2,0x | 1,5x |
| 4,0 | 4,0x | 2,2x |
| 8,0 | 8,0x | 3,0x (teto) |

### As três proteções que a fórmula sozinha não dá

1. **Suavização (EMA).** Sem ela o número pula 1,8x → 1,1x → 2,0x em dez
   segundos e ninguém confia no app. A média exponencial dá inércia:
   `novo = anterior + 0,25 × (medido − anterior)`.
2. **Zona morta.** Abaixo de 1,2x mostramos 1,0x. Um "surge de 1,05x" é ruído
   estatístico, não escassez.
3. **Teto de 3,0x.** É decisão de produto **e questão legal**: durante
   emergências, cobrar 5x configura *price gouging* e é ilegal em várias
   jurisdições. Empresas de mobilidade já foram processadas por não desligar o
   surge nessas horas. Ótimo parágrafo para a parte de ética do seu trabalho.

### O detalhe que faz o surge existir

Olhe o `ATRASO = 5` em `zonasDemanda.js`. A demanda usa a onda no tempo atual;
a oferta usa a onda de **5 ticks atrás** — motoristas levam tempo para perceber
o movimento e chegar lá. **É esse atraso entre demanda e oferta que cria a
escassez.** Coloque `ATRASO = 0` e rode: o surge quase desaparece. Faça esse
teste, vale mais que ler qualquer explicação.

---

## 3. Como o Uber de verdade faz diferente

| Aqui | No app real |
|---|---|
| Grade de **quadrados** | **Hexágonos** (biblioteca H3, criada pela própria Uber) |
| Simulação no celular | Servidor agregando milhares de eventos por segundo |
| Onda senoidal | Previsão por machine learning (histórico, clima, eventos, trânsito) |
| Multiplicador puro | Modelos de "tarifa aditiva" e incentivos direcionados |

**Por que hexágono?** Num hexágono, todos os 6 vizinhos estão à mesma distância
do centro. Num quadrado, o vizinho da diagonal está 41% mais longe que o do
lado — o que distorce qualquer cálculo que espalhe demanda para os vizinhos.
Além disso, hexágonos não criam aquele efeito visual de papel quadriculado.

---

## 4. As armadilhas de performance que este código evita

Isto vale para qualquer camada de dados sobre mapa, não só surge:

1. **Grade memoizada com âncora arredondada.** Se a grade dependesse da posição
   exata do GPS, seriam 81 polígonos recriados a cada metro andado. Arredondamos
   o centro para 2 casas decimais (~1,1 km): a grade só se move quando você
   realmente saiu da área.
2. **`tracksViewChanges={false}`** em todo Marker com conteúdo React. Sem isso,
   cada marcador re-renderiza sua imagem continuamente. É *o* erro nº 1 de
   performance com `react-native-maps`.
3. **Não desenhar o irrelevante.** Células de nível 0 dão `return null`.
4. **Só 6 etiquetas.** No pico, 20 números "1.6x" na tela viram ruído.
5. **Estado da EMA em `useRef`, não `useState`.** É memória do algoritmo, não
   algo que a tela desenha — em state causaria um render extra por rodada.

---

## 5. Exercícios

1. **Fácil:** mude `ATRASO` para 0 e depois para 12. Descreva o que acontece com
   o mapa. Depois mexa em `ALFA` (0,3 e 0,9) e em `TETO`.
2. **Médio:** use `fatorHorario` de verdade — deixe o usuário escolher a hora
   num slider e veja a cidade "acordar" às 8h e às 18h.
3. **Médio:** implemente também o `<Heatmap>` do react-native-maps com os
   mesmos dados (`points` com `weight` = pedidos) e coloque um botão para
   alternar entre heatmap e polígonos. Qual comunica melhor? Por quê?
4. **Difícil:** troque a grade quadrada por **hexágonos**. Fórmula: centro em
   `x = col × 1,5r`, `y = lin × √3 r + (col ímpar ? √3r/2 : 0)`, e os 6 vértices
   em ângulos de 0°, 60°, …, 300°. Compare visualmente com os quadrados.
5. **Difícil / vira artigo:** feche o ciclo. Faça os motoristas simulados
   **migrarem** para as células com multiplicador alto no tick seguinte. O surge
   deve cair sozinho quando eles chegam. Você acabou de implementar um mercado
   com realimentação negativa — plote o multiplicador ao longo do tempo e mostre
   a oscilação amortecida.

---

## 6. Boa pergunta para levar ao professor

O surge é economicamente eficiente, mas ele redistribui: quem tem menos dinheiro
é quem desiste da corrida. Vale perguntar se "eficiente" e "justo" são a mesma
coisa aqui — e é exatamente esse tipo de discussão que diferencia um TCC de
Sistemas de Informação de um tutorial de programação.
