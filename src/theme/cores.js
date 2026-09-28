import { familia } from './tipografia';
/**
 * TEMA CENTRAL DO APP
 * -------------------
 * Regra de ouro em programação móvel: nunca escreva uma cor "solta" (#000)
 * dentro de um componente. Centralize aqui. Assim você troca o visual do app
 * inteiro mudando um arquivo só — e depois consegue criar tema claro/escuro.
 *
 * Os tokens abaixo seguem a §2.2 do SYSTEM-DESIGN.md. Repare que existem
 * DOIS mundos visuais e isso é intencional:
 *
 *   mundo de GESTÃO  → escuro (listas, formulários, ganhos, perfil)
 *   mundo de DIREÇÃO → superfície CLARA flutuando sobre o mapa
 *
 * A troca de tema é o próprio produto dizendo "agora é o momento operacional".
 */

export const cores = {
  // Fundo em camadas (do mais escuro ao mais claro) — dá sensação de profundidade
  fundo: '#0B0B0F',
  superficie: '#17171C',
  superficieAlta: '#22222A',

  // Texto (três níveis: nunca use só dois — some a hierarquia)
  texto: '#FFFFFF',
  textoSecundario: '#A0A0AB',
  textoTerciario: '#6B6B76',

  // Ação — o azul do CTA "Ficar online" e dos links
  acao: '#3E6FF0',
  acaoPressionado: '#2F58C4',
  acaoSuave: 'rgba(62,111,240,0.14)',

  // Cores de estado do motorista
  online: '#1FD65F',      // verde = disponível para receber corridas
  offline: '#6B6B76',     // cinza = indisponível
  alerta: '#FFB020',
  erro: '#FF4D4F',

  // Bônus (badge "+R$ 15") — roxo, fora da rampa de demanda de propósito:
  // é dinheiro garantido, não é "está quente aqui".
  bonus: '#7B2FBE',

  // Destaques
  destaque: '#FFFFFF',
  borda: '#2C2C35',

  // Transparências úteis
  sombra: 'rgba(0,0,0,0.45)',
  vidro: 'rgba(23,23,28,0.92)',
  vidroEscuro: 'rgba(11,11,15,0.85)',
};

/**
 * MUNDO CLARO — as superfícies que flutuam sobre o mapa durante a direção.
 * Separado em outro objeto para você nunca misturar por acidente: escrever
 * `cores.texto` (branco) dentro de um sheet branco é o bug visual nº 1.
 */
export const claro = {
  fundo: '#F5F5F7',
  superficie: '#FFFFFF',
  superficieAlta: '#F0F0F3',
  texto: '#0B0B0F',
  textoSecundario: '#5A5A66',
  borda: '#E6E6EA',
  positivo: '#0F8B40',   // verde escurecido para ter contraste sobre branco
  destrutivo: '#A6293A',
};

/** Espaçamentos em escala de 4px — mantém o layout ritmado */
export const espaco = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

/** Raios de borda (§2.4) */
export const raio = {
  campo: 10,      // inputs e chips
  sm: 8,
  md: 14,         // cards
  sheet: 20,      // bottom sheet (só o topo)
  lg: 24,
  pill: 28,       // botões
  redondo: 999,
};

/**
 * Tipografia legada — mantida porque os componentes do Módulo 1 a usam.
 * Para código novo prefira `src/theme/tipografia.js`, que tem a escala
 * completa da especificação (display, h1…micro).
 */
export const fonte = {
  titulo: { fontSize: 22, fontFamily: familia.bold },
  subtitulo: { fontSize: 16, fontFamily: familia.semi },
  corpo: { fontSize: 14, fontFamily: familia.regular },
  legenda: { fontSize: 12, fontFamily: familia.media },
};

/** Durações e curvas de animação (§2.4) — centralizadas pelo mesmo motivo das cores. */
export const tempo = {
  rapido: 160,
  padrao: 240,
  sheet: 320,
  pulso: 1600,
};

/**
 * Estilo do Google Maps em modo escuro.
 * O react-native-maps aceita um array JSON de regras de estilo (mesmo formato
 * do Google Maps Styling Wizard). Isso é o que faz o mapa "parecer" o do Uber.
 */
export const estiloMapaEscuro = [
  { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#6f9ba5' }] },
  { featureType: 'poi.park', elementType: 'geometry.fill', stylers: [{ color: '#023e58' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2c6675' }] },
  { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
];
