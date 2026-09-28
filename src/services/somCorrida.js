import { Audio } from 'expo-av';

/**
 * SOM DA SOLICITAÇÃO DE CORRIDA (§6.3)
 * ====================================
 * O alerta que toca EM LOOP enquanto uma viagem está sendo oferecida, e para
 * no instante em que o motorista aceita, recusa ou o tempo esgota.
 *
 * POR QUE O SOM É A PARTE MAIS IMPORTANTE DESTE MOMENTO
 * -----------------------------------------------------
 * A solicitação chega enquanto o motorista está DIRIGINDO. Ele não pode olhar
 * a tela para descobrir que ela apareceu — nem deveria. O som (com a vibração)
 * é o único canal que chega sem exigir os olhos, e por isso a tela pode se dar
 * ao luxo de ser bonita: ninguém depende dela para saber que algo aconteceu.
 *
 * POR QUE EM LOOP, E NÃO UMA VEZ SÓ
 * ---------------------------------
 * Um bipe único se perde: janela aberta, rádio ligado, conversa no carro. E
 * quem ouviu no segundo 1 pode estar numa conversão e só conseguir olhar no
 * segundo 6. O loop mantém o aviso vivo pelos 12 segundos da oferta e some
 * assim que a decisão é tomada — que é o comportamento de um telefone tocando,
 * não o de uma notificação.
 *
 * DUAS ARMADILHAS QUE ESTE ARQUIVO RESOLVE
 * ----------------------------------------
 *
 * 1. O MODO SILENCIOSO DO iPHONE. Por padrão, o iOS silencia áudio de app
 *    quando o interruptor lateral está no mudo — e é justamente assim que
 *    muita gente anda com o telefone. Um alerta de trabalho que não toca no
 *    silencioso é um alerta que não existe. `playsInSilentModeIOS` conserta.
 *
 * 2. CORRIDA ENTRE TOCAR E PARAR. Se o motorista recusa no mesmo instante em
 *    que a oferta chega, `parar()` pode rodar ANTES de `tocar()` terminar de
 *    carregar o arquivo — e aí o som começaria depois de já ter sido mandado
 *    parar, tocando para sempre. O contador `geracao` resolve: cada `tocar()`
 *    recebe um número, e ao terminar de carregar confere se ainda é o pedido
 *    mais recente. Se não for, descarrega e sai calado.
 */

/**
 * O ALERTA É UM CICLO DE 2 SEGUNDOS, NÃO A GRAVAÇÃO CRUA
 * ------------------------------------------------------
 * `solicitacao-original.mp3` (guardado ao lado, sem uso no app) é o áudio
 * extraído do vídeo: 5,6 s, dos quais os 3 PRIMEIROS são só chiado, sem toque
 * nenhum. Em loop isso era um alerta que levava 3 segundos para fazer barulho
 * — numa oferta que dura 12.
 *
 * Medindo os dois toques da gravação, os ataques caem em 3,057 s e 5,057 s:
 * exatamente 2 s de período. Então `solicitacao.wav` é UM ciclo — o toque e o
 * intervalo que vem depois dele. Em loop, ele reproduz a cadência original sem
 * emenda, porque o corte começa e termina na mesma fase do padrão.
 *
 * O intervalo foi zerado por uma porta de ruído (o chiado da gravação media
 * −36 dB), e o arquivo é mono 24 kHz porque o original não tem nada acima de
 * 12 kHz — o próprio MP3 já havia cortado ali.
 *
 * WAV e não MP3 de propósito: além de não precisar reencodar um áudio que já é
 * lossy, MP3 carrega padding do codificador no começo e no fim, e esse padding
 * vira um clique audível a cada volta do loop.
 */
const ARQUIVO = require('../../assets/sons/solicitacao.wav');

let somAtual = null;
let geracao = 0;
let modoConfigurado = false;

/**
 * Existe só para a versão web (`somCorrida.web.js`), onde o navegador exige um
 * toque do usuário antes de liberar o áudio. No aparelho não há o que
 * destravar: um app instalado toca quando quiser.
 *
 * O par de arquivos precisa exportar a MESMA API — senão o AppProvider teria
 * que perguntar em que plataforma está rodando, que é exatamente o `if` que a
 * convenção `.web.js` existe para eliminar.
 */
export function destravarAudio() {}

/**
 * Configura o comportamento do áudio uma vez por sessão.
 * Falha em silêncio: um app que não abre porque o mixer de áudio recusou uma
 * flag seria bem pior que um app sem som.
 */
async function garantirModoDeAudio() {
  if (modoConfigurado) return;
  try {
    await Audio.setAudioModeAsync({
      // A razão de existir desta função — ver a armadilha 1 acima.
      playsInSilentModeIOS: true,
      // Não somos música: se o motorista estiver ouvindo algo, abaixamos o
      // volume dele durante o alerta em vez de matar a reprodução.
      interruptionModeIOS: 1, // DoNotMix
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
    modoConfigurado = true;
  } catch (e) {
    console.warn('Não consegui configurar o modo de áudio:', e);
  }
}

/** Começa o alerta em loop. Chamar duas vezes seguidas não empilha dois sons. */
export async function tocarSolicitacao() {
  const minhaGeracao = ++geracao;

  // Se já havia um tocando, ele sai de cena antes do novo entrar.
  await pararInterno();

  await garantirModoDeAudio();

  try {
    const { sound } = await Audio.Sound.createAsync(
      ARQUIVO,
      { shouldPlay: true, isLooping: true, volume: 1.0 }
    );

    // Enquanto o arquivo carregava, o motorista pode já ter decidido. Se
    // outra geração começou (ou `parar()` foi chamado), este som chegou
    // atrasado e não deve soar.
    if (minhaGeracao !== geracao) {
      await sound.unloadAsync().catch(() => {});
      return;
    }

    somAtual = sound;
  } catch (e) {
    // Sem dispositivo de áudio, arquivo ilegível, autoplay bloqueado no
    // navegador. O alerta visual e a vibração continuam de pé.
    console.warn('Não consegui tocar o alerta de corrida:', e);
  }
}

/** Para o alerta. Seguro chamar mesmo quando nada está tocando. */
export async function pararSolicitacao() {
  geracao++; // invalida qualquer carregamento em voo
  await pararInterno();
}

async function pararInterno() {
  const som = somAtual;
  somAtual = null;
  if (!som) return;
  try {
    await som.stopAsync();
  } catch (e) {
    // Já estava parado ou descarregado. Seguimos para o unload mesmo assim.
  }
  try {
    // `unloadAsync` devolve a memória e libera o canal de áudio. Sem isto,
    // cada oferta recusada deixaria um som carregado para trás — e depois de
    // algumas dezenas o app começa a falhar ao abrir novos.
    await som.unloadAsync();
  } catch (e) {
    // Nada a fazer: o objetivo (não tocar mais) já foi alcançado.
  }
}
