import { Asset } from 'expo-asset';

/**
 * SOM DA SOLICITAÇÃO — VERSÃO WEB (§6.3)
 * ======================================
 * Mesma API de `somCorrida.js`, implementada com um `<audio>` cru em vez do
 * expo-av. O Metro escolhe este arquivo sozinho na build web, como já faz com
 * `SuperficieMapa.web.js`.
 *
 * POR QUE O NAVEGADOR PRECISA DE UM ARQUIVO SÓ DELE
 * ------------------------------------------------
 * No celular, o navegador RECUSA tocar áudio que não nasceu de um toque do
 * usuário. E a oferta de corrida chega por temporizador, seis segundos depois
 * do mapa abrir — não há toque nenhum na pilha de chamadas. Resultado: o
 * `play()` é rejeitado e o alerta simplesmente não soa.
 *
 * A saída é DESTRAVAR o áudio antes: durante um toque de verdade, tocamos o
 * arquivo com volume zero e pausamos no mesmo instante. O navegador registra
 * que aquele elemento foi liberado pelo usuário, e a partir daí ele pode tocar
 * quando quisermos — inclusive por temporizador.
 *
 * O toque escolhido é o botão "Ficar online" (veja `destravarAudio` no
 * AppProvider). Não é uma escolha estética: ele é OBRIGATÓRIO no caminho até
 * receber uma corrida, então é impossível chegar numa oferta sem ter passado
 * por ele.
 *
 * ISTO PRECISA DE UM ELEMENTO SÓ, REUTILIZADO
 * -------------------------------------------
 * A liberação vale para o ELEMENTO que foi tocado, não para a página. Se cada
 * oferta criasse um `<audio>` novo, cada um nasceria travado de novo e o
 * destrave teria sido inútil. Por isso `pararSolicitacao` pausa e rebobina em
 * vez de descartar.
 *
 * O QUE ESTE ARQUIVO NÃO CONSEGUE RESOLVER
 * ----------------------------------------
 * No iPhone, o interruptor lateral de silencioso corta o áudio de páginas web
 * — e isso não tem contorno por código. O `playsInSilentModeIOS` da versão
 * nativa existe justamente porque só um app instalado pode pedir essa exceção.
 * Se o alerta não soar num iPhone, o silencioso é o primeiro suspeito.
 */

/** Um ciclo de 2 s (toque + intervalo). O porquê está em `somCorrida.js`. */
const ARQUIVO = require('../../assets/sons/solicitacao.wav');

/**
 * Um instante DENTRO do silêncio do arquivo.
 *
 * O ciclo tem o toque até ~0,9 s e o intervalo mudo de 1 s a 2 s. Posicionar o
 * destrave aqui é o que garante que, mesmo se o mudo falhar em algum
 * navegador, o que toca é silêncio de verdade — e não o começo do toque.
 */
const SEGUNDOS_SILENCIO = 1.4;

/** @type {HTMLAudioElement | null} */
let elemento = null;
let destravado = false;
let geracao = 0;

/**
 * `currentTime` lança se o elemento ainda não tem metadados (o Safari é o
 * mais rígido). Falhar aqui não é motivo para abortar nada: a reprodução
 * seguinte reposiciona de qualquer forma.
 */
function posicionar(el, segundos) {
  try {
    el.currentTime = segundos;
  } catch (e) {
    // Sem metadados ainda; segue de onde estiver.
  }
}

function garantirElemento() {
  if (elemento) return elemento;
  if (typeof window === 'undefined' || typeof window.Audio !== 'function') return null;
  try {
    const el = new window.Audio(Asset.fromModule(ARQUIVO).uri);
    el.loop = true;
    // `auto` faz o navegador baixar o arquivo já na abertura do app. Sem isso
    // o destrave pegaria um elemento vazio, e a primeira oferta esperaria o
    // download — bem no segundo em que o som mais importa.
    el.preload = 'auto';
    elemento = el;
  } catch (e) {
    console.warn('Não consegui criar o elemento de áudio:', e);
  }
  return elemento;
}

/**
 * Libera o áudio para tocar depois sem toque do usuário.
 *
 * PRECISA SER CHAMADA DE DENTRO DE UM MANIPULADOR DE TOQUE, e sem `await`
 * antes: o navegador só aceita o `play()` enquanto o gesto ainda está "quente".
 * Uma espera no meio do caminho invalida a liberação em silêncio.
 *
 * Chamar de novo depois de destravado não custa nada — sai na primeira linha.
 */
export function destravarAudio() {
  if (destravado) return;
  const el = garantirElemento();
  if (!el) return;

  /**
   * DUAS PROTEÇÕES, PORQUE UMA DELAS NÃO FUNCIONA NO IPHONE
   * -------------------------------------------------------
   * A primeira versão zerava `volume` durante o destrave. No computador
   * funcionava; no iPhone, não — o iOS IGNORA volume programático em elementos
   * de mídia, porque lá o volume é do aparelho, não da página. O destrave
   * então tocava o alerta no volume real por um instante, e o motorista ouvia
   * um pedaço do toque ao apertar "Ficar online".
   *
   * `muted` o iOS respeita. E, por cima, posicionamos no trecho SILENCIOSO do
   * arquivo: se um dia o mudo falhar em algum navegador, o que toca é silêncio
   * de verdade em vez do começo do toque.
   *
   * A duração do destrave não é controlável — depende de quando o navegador
   * resolve a promessa do `play()`. Por isso a defesa é o CONTEÚDO ser mudo,
   * e não o intervalo ser curto.
   */
  el.muted = true;
  posicionar(el, SEGUNDOS_SILENCIO);

  const restaurar = () => {
    el.pause();
    posicionar(el, 0);
    el.muted = false;
  };

  try {
    const promessa = el.play();
    if (promessa && typeof promessa.then === 'function') {
      promessa.then(
        () => {
          restaurar();
          destravado = true;
        },
        () => {
          // Recusado: o gesto não valeu, ou o arquivo ainda não carregou.
          // Tentamos de novo no próximo toque — nada quebra por isso.
          restaurar();
        }
      );
    } else {
      restaurar();
      destravado = true;
    }
  } catch (e) {
    restaurar();
  }
}

/** Começa o alerta em loop. Chamar duas vezes seguidas não empilha dois sons. */
export async function tocarSolicitacao() {
  const minhaGeracao = ++geracao;
  const el = garantirElemento();
  if (!el) return;

  posicionar(el, 0);
  // Desfaz o mudo do destrave explicitamente. Se aquele `play()` tivesse sido
  // recusado no meio do caminho, o `muted` teria ficado ligado — e o alerta
  // rodaria certinho, em silêncio, sem nenhum erro para denunciar.
  el.muted = false;
  el.volume = 1;

  try {
    await el.play();
    // Enquanto o navegador resolvia o `play()`, o motorista pode já ter
    // decidido. Se outra geração começou, este som chegou atrasado.
    if (minhaGeracao !== geracao) el.pause();
  } catch (e) {
    // Autoplay bloqueado (destrave não aconteceu) ou aba sem permissão. O
    // alerta visual e a vibração continuam de pé.
    console.warn('Não consegui tocar o alerta de corrida:', e);
  }
}

/** Para o alerta. Seguro chamar mesmo quando nada está tocando. */
export async function pararSolicitacao() {
  geracao++; // invalida qualquer `play()` em voo
  if (!elemento) return;
  elemento.pause();
  posicionar(elemento, 0);
}
