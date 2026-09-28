import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

import { REGIAO_PADRAO } from '../data/locais';
import { PALETA_DEMANDA, corSolida } from '../services/precoDinamico';

/**
 * SUPERFÍCIE DO MAPA — versão WEB
 * ===============================
 *
 * Mesma interface de props do `SuperficieMapa.js` (nativo), implementação
 * completamente diferente. O Metro escolhe este arquivo automaticamente na
 * build web por causa do sufixo `.web` — a tela que nos usa não muda uma linha.
 * A explicação do mecanismo está no arquivo nativo.
 *
 * POR QUE LEAFLET, E NÃO GOOGLE MAPS
 * ----------------------------------
 * O `react-native-maps` não roda no navegador: ele importa internals do React
 * Native que o `react-native-web` não tem. Precisávamos de outro mapa, e havia
 * duas saídas:
 *
 *   • Google Maps JS — mesmo visual do app nativo, mas exige uma chave de API,
 *     cartão de crédito cadastrado e um domínio autorizado. Numa apresentação
 *     de faculdade, é uma chave a mais para vazar e uma cobrança a mais para
 *     esquecer.
 *   • Leaflet + um provedor de tiles escuros aberto — sem chave, sem custo, e
 *     visualmente próximo do estilo escuro que usamos no Google Maps do
 *     celular.
 *
 * Ficamos no segundo. O mapa é REAL: ruas, bairros e pontos de referência de
 * Fortaleza, os mesmos que aparecem na gravação.
 *
 * O provedor concreto está em `TILES`, mais abaixo, junto com o histórico de
 * por que ele já mudou uma vez. Provedor gratuito é uma dependência que pode
 * mudar de política sem aviso — vale conferir a IMAGEM do mapa de vez em
 * quando, não só se ele carregou.
 *
 * ATENÇÃO: os tiles vêm da rede. Sem internet, o mapa fica cinza (o resto do
 * app continua funcionando). Se a apresentação for em sala sem Wi-Fi
 * confiável, rode no celular — lá o mapa é o Google Maps nativo, que tem cache
 * offline próprio.
 *
 * POR QUE MANIPULAR O DOM DIRETO EM VEZ DE USAR react-leaflet
 * -----------------------------------------------------------
 * O Leaflet não é um componente React: ele cria e gerencia o próprio DOM. O
 * jeito correto de encaixar uma biblioteca imperativa assim é dar a ela um nó
 * "de posse" e nunca deixar o React tocar no conteúdo dele — que é exatamente
 * o que fazemos com `containerRef`. Os `useEffect` abaixo traduzem mudanças de
 * props em chamadas do Leaflet, e limpam o que criaram.
 *
 * `react-leaflet` faria isso por nós, mas é mais uma dependência com sua
 * própria matriz de compatibilidade — e aqui o trabalho manual cabe em 100
 * linhas e ensina o padrão.
 */

/**
 * O mapa da web tem coordenadas de verdade, mas não depende do GPS do usuário
 * para ser útil: sem permissão ele mostra Fortaleza. Por isso a tela NÃO manda
 * o usuário para o erro de "sem GPS" aqui.
 */
export const PRECISA_GPS = false;

/**
 * O crédito obrigatório do OpenStreetMap vem com fundo branco por padrão — um
 * retângulo claro no canto de um mapa escuro. Não dá para removê-lo (é
 * condição de uso dos tiles), então o certo é vesti-lo com o tema do app.
 *
 * Injetamos a regra UMA vez, no `<head>`, em vez de por instância: o Leaflet
 * cria esse controle no próprio DOM, fora do alcance do StyleSheet do React
 * Native. É o caso legítimo de escrever CSS na mão num app RN — e ele existe
 * só aqui, no arquivo que já é exclusivo da web.
 */
const ID_ESTILO = 'estilo-leaflet-escuro';
function aplicarEstiloEscuro() {
  if (typeof document === 'undefined' || document.getElementById(ID_ESTILO)) return;
  const tag = document.createElement('style');
  tag.id = ID_ESTILO;
  tag.textContent = `
    .leaflet-container { background: #101118; }

    /* O canvas escuro da Esri é CINZA MÉDIO, não preto. Medindo o tile: terra
       em luminância 77, ruas entre 85 e 95, água em 35. O app é quase preto
       (fundo 11, superfícies 23 e 34), então sem correção o mapa vira um
       retângulo claro no meio de uma tela escura.

       POR QUE NÃO BASTA ESCURECER
       ---------------------------
       Entre terra (77) e rua (95) há só 18 níveis. Multiplicar tudo por um
       fator comprime essa diferença junto: com brightness(0.20) o mapa fica
       preto, sim, mas com 4 níveis separando rua de quarteirão — ou seja, um
       retângulo preto liso, sem ruas. Escuro e ilegível é pior que claro.

       Por isso ABRIMOS O CONTRASTE e escurecemos: o contraste afasta rua de
       terra antes de o brilho puxar tudo para baixo.

       Os números saíram de uma conta, não do olho. O contraste gira em torno
       de 127,5 e o brilho multiplica, então a saída é
       k·c·entrada + k·127,5·(1−c). Resolvendo para levar 77→~10 e 95→~48 dá
       c≈2,31 e k≈0,91. Medido depois de aplicar: água 0, terra 9, ruas até 47,
       com 38 níveis de separação contra os 7 de antes.

       Se o provedor mudar o tom dos tiles um dia, refaça a medição em vez de
       ajustar no olho — o contraste baixo da origem é o que torna esse ajuste
       traiçoeiro.

       O filtro vale SÓ para a camada base. A camada de rótulos leva classe
       própria e fica de fora: escurecer os nomes das ruas junto apagaria a
       única coisa que o motorista precisa ler. */
    .tiles-mapa-base { filter: contrast(2.31) brightness(0.91); }

    .leaflet-control-attribution {
      background: rgba(11,11,15,0.72) !important;
      color: #6B6B76 !important;
      font-size: 9px !important;
      padding: 1px 6px !important;
      border-radius: 6px 0 0 0;
    }
    .leaflet-control-attribution a { color: #8A8A96 !important; }
  `;
  document.head.appendChild(tag);
}

/**
 * TILES ESCUROS DA ESRI — "World Dark Gray Canvas".
 *
 * POR QUE NÃO É MAIS O CARTO
 * --------------------------
 * O mapa base era o CARTO "dark matter", escolhido por ser gratuito e sem
 * chave. A CARTO mudou a política: hoje os mesmos endereços respondem 200 com
 * uma imagem de mapa CARIMBADA com "API KEY REQUIRED" atravessada. Não é erro
 * de rede nem 403 — é um tile válido, com o desenho certo e um aviso por cima.
 *
 * Isso torna a falha traiçoeira: o mapa continua carregando, o Leaflet não
 * reclama, o console fica limpo, e qualquer verificação que conte elementos no
 * DOM passa. Só olhando a imagem dá para ver.
 *
 * A Esri publica este canvas escuro sem chave, e ele é o que mais se parece
 * com o que havia antes: ruas claras sobre fundo grafite, no mesmo espírito do
 * mapa escuro do app nativo.
 *
 * ATENÇÃO AO ZOOM: a Esri serve este canvas até o nível 16. Acima disso ela
 * devolve um placeholder cinza escrito "map data not yet available" — o mesmo
 * tipo de armadilha do CARTO. Por isso o `maxZoom` abaixo é 16, e não 19.
 *
 * A ordem das coordenadas é {z}/{y}/{x}, invertida em relação ao padrão
 * OpenStreetMap. Trocar y e x sem perceber devolve tiles de outro lugar do
 * planeta, não um erro.
 */
const TILES =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';

/**
 * Os nomes de ruas e bairros vêm numa camada SEPARADA, por cima do base. É
 * assim que a Esri publica: o canvas é só a geometria. Sem esta camada o mapa
 * fica bonito e ilegível — e o motorista precisa reconhecer o bairro.
 */
const TILES_ROTULOS =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}';

/** Zoom máximo que a Esri realmente serve neste canvas. Ver comentário acima. */
const ZOOM_MAX_TILES = 16;

const CREDITO = 'Tiles &copy; <a href="https://www.esri.com">Esri</a>';

export default function SuperficieMapa({
  local,
  zonas,
  mostrarDemanda,
  onSelecionarZona,
  rota,
  paradas = [],
  seguindo,
  dirigindo,
  onArrastar,
  onTocarFundo,
  estatico = false,
}) {
  const containerRef = useRef(null);
  const mapaRef = useRef(null);

  /**
   * O TAMANHO DO CONTÊINER É PRÉ-REQUISITO, NÃO DETALHE
   * ---------------------------------------------------
   * O Leaflet mede o elemento no instante em que é criado. Dentro de um
   * flexbox do react-native-web, no primeiro render esse elemento ainda tem
   * 0×0 — o layout só é calculado depois. Criar o mapa aí produz um mapa de
   * largura zero, e a camada de calor estoura com
   *
   *     IndexSizeError: getImageData ... source width is 0
   *
   * porque ela tenta ler pixels de um canvas vazio.
   *
   * Medimos com `ResizeObserver` em vez do `onLayout` do React Native. O
   * onLayout existe e seria o caminho "multiplataforma", mas aqui ele não
   * entrega: num elemento de preenchimento absoluto (`inset: 0`) o
   * react-native-web não dispara um segundo evento quando o tamanho chega, e
   * o mapa fica esperando para sempre.
   *
   * Este arquivo só roda no navegador — usar a API do navegador diretamente é
   * a escolha certa, não uma gambiarra. O ResizeObserver também cobre de
   * graça o redimensionamento da janela.
   */
  const [tamanho, setTamanho] = useState({ largura: 0, altura: 0 });

  /**
   * Sinal de "o mapa existe". Os efeitos das camadas (calor, pills, rota,
   * puck) leem `mapaRef.current`, que é uma ref — e mudar uma ref NÃO dispara
   * re-render nem re-executa efeito.
   *
   * Sem este estado, a ordem seria: efeitos das camadas rodam (mapa ainda
   * null, saem cedo) → layout chega → mapa é criado → e nada mais roda. O mapa
   * apareceria vazio, sem calor e sem pills, para sempre.
   *
   * É a regra geral: se um efeito depende de algo criado por outro efeito,
   * esse "algo" precisa de estado, não de ref.
   */
  const [mapaPronto, setMapaPronto] = useState(false);
  const calorRef = useRef(null);
  const pillsRef = useRef([]);
  const rotaRef = useRef(null);
  const paradasRef = useRef([]);
  const puckRef = useRef(null);

  // ── Estilo do crédito (uma vez por página) ───────────────────────────────
  useEffect(() => {
    aplicarEstiloEscuro();
  }, []);

  // ── Medição do contêiner ─────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;

    const medir = () => {
      const r = el.getBoundingClientRect();
      const largura = Math.round(r.width);
      const altura = Math.round(r.height);
      // Só atualiza quando muda de verdade: um setState incondicional aqui
      // vira laço infinito, porque re-render dispara nova medição.
      setTamanho((t) => (t.largura === largura && t.altura === altura ? t : { largura, altura }));
    };

    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  /**
   * O GATILHO DE CRIAÇÃO É UM BOOLEANO, NÃO AS MEDIDAS
   * --------------------------------------------------
   * Antes este efeito dependia de `tamanho.largura` e `tamanho.altura`. Como
   * ele tem limpeza, isso significava: TODA vez que o contêiner mudava de
   * tamanho, o mapa era destruído e reconstruído do zero.
   *
   * No navegador comum isso quase não aparecia — a janela mede uma vez e fica
   * parada. Mas ABERTO PELA TELA DE INÍCIO, como aplicativo, o iOS reajusta a
   * altura da viewport logo depois de abrir (barra de status, área segura).
   * Essa mudança destruía o mapa recém-criado, e as camadas iam junto.
   *
   * O calor voltava sozinho no tick seguinte do simulador, mas o PUCK não:
   * ele só é recriado quando `local` muda, e sem permissão de GPS `local`
   * nunca muda. Resultado: o ponteiro sumia de vez.
   *
   * Com um booleano, o efeito roda uma vez — quando o primeiro tamanho válido
   * chega — e redimensionamentos seguintes não o reexecutam. Quem cuida deles
   * é o `invalidateSize` logo abaixo, que é o que o Leaflet realmente pede.
   */
  const temTamanho = tamanho.largura > 0 && tamanho.altura > 0;

  // ── Criação do mapa (uma vez só) ─────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapaRef.current || !temTamanho) return undefined;

    const mapa = L.map(containerRef.current, {
      center: [REGIAO_PADRAO.latitude, REGIAO_PADRAO.longitude],
      zoom: estatico ? 12 : 13,
      zoomControl: false,
      // O crédito do OpenStreetMap/CARTO fica MESMO na prévia. Não é enfeite
      // que dá para cortar por falta de espaço: usar os tiles deles obriga a
      // exibir a atribuição, e é a condição de uso ser gratuito.
      attributionControl: true,
      // Prévia = sem gestos, pelo mesmo motivo do nativo.
      dragging: !estatico,
      scrollWheelZoom: !estatico,
      doubleClickZoom: !estatico,
      touchZoom: !estatico,
      boxZoom: !estatico,
      keyboard: !estatico,
    });

    L.tileLayer(TILES, {
      attribution: CREDITO,
      maxZoom: ZOOM_MAX_TILES,
      // Ver `.tiles-mapa-base` no estilo injetado: escurece a base para o tom
      // do app, sem tocar nos rótulos.
      className: 'tiles-mapa-base',
    }).addTo(mapa);
    L.tileLayer(TILES_ROTULOS, { maxZoom: ZOOM_MAX_TILES }).addTo(mapa);

    if (!estatico) {
      mapa.on('dragstart', () => onArrastar && onArrastar());
      mapa.on('click', () => onTocarFundo && onTocarFundo());
    }

    mapaRef.current = mapa;
    setMapaPronto(true);

    // Limpeza: sem isto, cada remontagem da tela deixa um mapa órfão
    // segurando listeners e um canvas — o vazamento clássico de biblioteca
    // imperativa dentro do React.
    return () => {
      mapa.remove();
      mapaRef.current = null;
      // As camadas morrem JUNTO com o mapa que as continha. Sem zerar estas
      // refs, elas ficariam apontando para objetos de um mapa que não existe
      // mais — e o efeito do puck, que reaproveita o marcador quando a ref
      // está preenchida, atualizaria o marcador morto em vez de criar um novo
      // no mapa novo. Era essa linha faltando que fazia o ponteiro sumir.
      calorRef.current = null;
      pillsRef.current = [];
      rotaRef.current = null;
      paradasRef.current = [];
      puckRef.current = null;
      setMapaPronto(false);
    };
  }, [temTamanho, estatico]); // eslint-disable-line react-hooks/exhaustive-deps

  // Se a janela mudar de tamanho depois, o Leaflet precisa ser avisado: ele
  // não observa o próprio contêiner.
  useEffect(() => {
    if (mapaRef.current && tamanho.largura > 0) mapaRef.current.invalidateSize();
  }, [tamanho.largura, tamanho.altura]);

  // ── Câmera ───────────────────────────────────────────────────────────────
  /**
   * A PRÉVIA TAMBÉM PRECISA OLHAR PARA O MOTORISTA
   * ----------------------------------------------
   * Antes este efeito saía na primeira linha quando `estatico`. A prévia então
   * ficava PARA SEMPRE no centro padrão (Fortaleza), enquanto o puck e a grade
   * de zonas são construídos em volta do GPS real.
   *
   * Com o motorista em Fortaleza — ou sem permissão de localização, que é o
   * caso de qualquer máquina de teste — os dois pontos coincidem e nada parece
   * errado. Fora de Fortaleza, o mapa mostra uma cidade e desenha os dados em
   * outra: as manchas de calor, as pills e o ponteiro caem dezenas de milhares
   * de pixels fora da área visível. O mapa aparece perfeito e vazio.
   *
   * "Estático" quer dizer SEM GESTOS — não "sem saber onde está". Enquadrar é
   * pré-requisito para os dados aparecerem; arrastar e dar zoom é que continua
   * desligado, porque a prévia mora dentro de uma tela que rola.
   *
   * `animate: false` de propósito: uma prévia que desliza sozinha ao abrir a
   * tela chama atenção para si em vez de para o que ela mostra.
   */
  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa || !local) return;

    if (estatico) {
      mapa.setView([local.latitude, local.longitude], mapa.getZoom(), { animate: false });
      return;
    }

    if (!seguindo) return;
    mapa.setView([local.latitude, local.longitude], dirigindo ? 15 : 13, { animate: true });
  }, [mapaPronto, estatico, local, seguindo, dirigindo]);

  // ── Manchas de calor ─────────────────────────────────────────────────────
  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa) return;

    if (calorRef.current) {
      mapa.removeLayer(calorRef.current);
      calorRef.current = null;
    }
    if (!mostrarDemanda) return;

    const pontos = zonas
      .filter((z) => z.nivel > 0)
      .map((z) => [
        z.centro.latitude,
        z.centro.longitude,
        Math.max(0.1, (z.multiplicadorInterno || z.multiplicador) - 1),
      ]);
    if (pontos.length === 0) return;

    calorRef.current = L.heatLayer(pontos, {
      radius: 44,
      blur: 34,
      maxZoom: 15,
      max: 1.6,
      // A mesma rampa amarelo→roxo da paleta nativa, para as duas plataformas
      // contarem a mesma história com as mesmas cores.
      gradient: { 0.1: '#F2B33D', 0.35: '#E8873A', 0.55: '#D9484B', 0.78: '#A8327D', 1: '#6E2BB5' },
    }).addTo(mapa);
  }, [mapaPronto, zonas, mostrarDemanda]);

  // ── Pills de ETA ─────────────────────────────────────────────────────────
  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa) return;

    pillsRef.current.forEach((m) => mapa.removeLayer(m));
    pillsRef.current = [];
    if (!mostrarDemanda) return;

    // Mesmo declutter do mapa nativo: candidatas grudadas numa já escolhida
    // são descartadas, senão as pills se empilham no mesmo quarteirão.
    const candidatas = zonas.filter((z) => z.nivel >= 2).sort((a, b) => b.multiplicador - a.multiplicador);
    const escolhidas = [];
    for (const z of candidatas) {
      if (escolhidas.length >= 6) break;
      const perto = escolhidas.some(
        (e) =>
          Math.abs(e.centro.latitude - z.centro.latitude) < 0.008 &&
          Math.abs(e.centro.longitude - z.centro.longitude) < 0.008
      );
      if (!perto) escolhidas.push(z);
    }

    for (const z of escolhidas) {
      const faixa = PALETA_DEMANDA[z.nivel];
      if (!faixa.eta) continue;

      const icone = L.divIcon({
        className: '',
        html:
          `<div style="background:${corSolida(z.nivel)};color:#fff;font:600 11px Inter,system-ui,sans-serif;` +
          `padding:5px 10px;border-radius:999px;white-space:nowrap;box-shadow:0 4px 14px rgba(0,0,0,.45);` +
          `cursor:pointer">↗ ${faixa.eta}</div>`,
        iconSize: null,
      });

      const marcador = L.marker([z.centro.latitude, z.centro.longitude], { icon: icone })
        .addTo(mapa)
        .on('click', (e) => {
          // Sem isto o clique chega ao mapa e o handler de fundo fecha o
          // painel no mesmo gesto que acabou de abri-lo.
          L.DomEvent.stopPropagation(e);
          if (onSelecionarZona) onSelecionarZona(z);
        });

      pillsRef.current.push(marcador);
    }
  }, [mapaPronto, zonas, mostrarDemanda, onSelecionarZona]);

  // ── Rota e destino ───────────────────────────────────────────────────────
  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa) return;

    if (rotaRef.current) { mapa.removeLayer(rotaRef.current); rotaRef.current = null; }
    paradasRef.current.forEach((m) => mapa.removeLayer(m));
    paradasRef.current = [];
    if (!rota) return;

    rotaRef.current = L.polyline(
      rota.map((p) => [p.latitude, p.longitude]),
      { color: '#FFFFFF', weight: 5, lineCap: 'round', lineJoin: 'round' }
    ).addTo(mapa);

    /**
     * DUAS PARADAS, DOIS DESENHOS DIFERENTES
     * --------------------------------------
     * Retirada é AZUL com uma pessoa; destino é BRANCO com um quadrado. A
     * diferença não é enfeite: enquanto a oferta está na tela os dois pinos
     * aparecem juntos, e o motorista precisa saber num relance qual é qual
     * para julgar a corrida. Dois pinos iguais em pontos diferentes obrigam a
     * ler os endereços no sheet para descobrir a direção da viagem.
     *
     * O azul é o mesmo `cores.acao` do app, e a pessoa é SVG desenhado à mão
     * em vez de um ícone de fonte: isto aqui é HTML cru dentro do Leaflet,
     * fora do alcance do `<Icone>` do React Native.
     */
    for (const parada of paradas) {
      const ehRetirada = parada.tipo === 'retirada';
      const html = ehRetirada
        ? `<div style="width:38px;height:38px;border-radius:19px;background:#3E6FF0;` +
          `border:3px solid #fff;display:flex;align-items:center;justify-content:center;` +
          `box-shadow:0 4px 14px rgba(0,0,0,.5)">` +
          `<svg viewBox="0 0 24 24" width="18" height="18" fill="#fff">` +
          `<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8z"/></svg></div>`
        : `<div style="width:30px;height:30px;border-radius:50%;background:#fff;display:flex;` +
          `align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0,0,0,.5)">` +
          `<div style="width:11px;height:11px;background:#0B0B0F;border-radius:3px"></div></div>`;
      const tamanho = ehRetirada ? 38 : 30;

      const marcador = L.marker([parada.ponto.latitude, parada.ponto.longitude], {
        icon: L.divIcon({ className: '', html, iconSize: [tamanho, tamanho], iconAnchor: [tamanho / 2, tamanho / 2] }),
        // Abaixo do puck (500) e acima do calor: o motorista é sempre o
        // elemento mais importante do mapa, mesmo com uma oferta na tela.
        zIndexOffset: 300,
      }).addTo(mapa);
      paradasRef.current.push(marcador);
    }

    mapa.fitBounds(rotaRef.current.getBounds(), {
      // O sheet da corrida cobre uns 40% da tela: sem folga embaixo, metade
      // da rota nasce escondida atrás dele.
      paddingTopLeft: [40, 120],
      paddingBottomRight: [40, 300],
    });
  }, [mapaPronto, rota, paradas]);

  // ── Puck do motorista ────────────────────────────────────────────────────
  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa) return;

    const centro = local
      ? [local.latitude, local.longitude]
      : [REGIAO_PADRAO.latitude, REGIAO_PADRAO.longitude];
    const giro = (local && local.heading) || 0;

    const html =
      `<div style="width:44px;height:44px;border-radius:22px;background:#fff;display:flex;` +
      `align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,.5)">` +
      `<div style="transform:rotate(${giro}deg);color:#0B0B0F;font-size:22px;line-height:1">▲</div></div>`;

    // `hasLayer` é o cinto de segurança: reaproveitar o marcador só é correto
    // se ele ainda pertence a ESTE mapa. Se um dia o mapa for recriado de
    // novo, um marcador órfão aqui viraria um puck invisível — e sem esta
    // verificação o bug voltaria calado, sem erro nenhum no console.
    if (puckRef.current && mapa.hasLayer(puckRef.current)) {
      puckRef.current.setLatLng(centro);
      puckRef.current.setIcon(
        L.divIcon({ className: '', html, iconSize: [44, 44], iconAnchor: [22, 22] })
      );
    } else {
      puckRef.current = L.marker(centro, {
        icon: L.divIcon({ className: '', html, iconSize: [44, 44], iconAnchor: [22, 22] }),
        zIndexOffset: 500,
      }).addTo(mapa);
    }
  }, [mapaPronto, local]);

  // O nó abaixo é "propriedade" do Leaflet: o React cria e nunca mais mexe no
  // conteúdo. É isso que impede as duas bibliotecas de brigarem pelo mesmo DOM.
  return <View style={estilos.area} ref={containerRef} />;
}

const estilos = StyleSheet.create({
  area: { ...StyleSheet.absoluteFillObject, backgroundColor: '#101118' },
});
