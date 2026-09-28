/**
 * HÁPTICA — vibração curta nos momentos decisivos (§6.3)
 * -----------------------------------------------------
 * A solicitação de corrida chega enquanto o motorista está DIRIGINDO. Ele não
 * pode olhar a tela para descobrir que ela apareceu. A vibração é o canal
 * certo: chega sem exigir os olhos.
 *
 * Cada chamada está blindada de propósito. `expo-haptics` é um módulo NATIVO:
 * ele existe no bundle, mas o motor de vibração pode não existir no ambiente
 * (emulador, iPad, navegador). Derrubar o app por causa de um feedback
 * secundário seria absurdo.
 *
 * ATENÇÃO A UMA ARMADILHA QUE SÓ APARECE RODANDO
 * ----------------------------------------------
 * As funções do expo-haptics são ASSÍNCRONAS. Um `try/catch` sozinho NÃO pega
 * a falha delas: quando a chamada não lança, mas devolve uma Promise que
 * rejeita, o catch nunca roda e você ganha um "Uncaught (in promise)" a cada
 * toque. No navegador isso enche o console; num app publicado, dependendo da
 * configuração, derruba a tela.
 *
 * Por isso `seguro()` faz as DUAS coisas: try/catch para a falha síncrona e
 * `.catch()` no valor devolvido para a assíncrona. Sempre que você blindar uma
 * API async, precisa dos dois — um não substitui o outro.
 *
 * Degradar em silêncio é a decisão certa AQUI — e repare que é uma exceção.
 * Para o GPS, falhar em silêncio seria péssimo: sem localização o app não tem
 * função, então lá o erro vira uma tela inteira (veja `SemGpsScreen`).
 */
let Haptics = null;
try {
  Haptics = require('expo-haptics');
} catch (e) {
  Haptics = null;
}

function seguro(fn) {
  if (!Haptics) return;
  try {
    const resultado = fn();
    // Se veio uma Promise, engole a rejeição. `&&` antes de `.catch` porque
    // uma versão futura da API pode devolver undefined.
    if (resultado && typeof resultado.catch === 'function') {
      resultado.catch(() => {});
    }
  } catch (e) {
    // Vibração indisponível neste ambiente. Segue o jogo.
  }
}

/** Chegou uma solicitação — o toque mais forte do app. */
export function avisarSolicitacao() {
  seguro(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}

/** Confirmação de uma ação importante (aceitar, iniciar, finalizar). */
export function confirmar() {
  seguro(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
}

/** Toque leve — troca de aba, seleção de card. */
export function leve() {
  seguro(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

/** Algo deu errado ou expirou. */
export function alertar() {
  seguro(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
}
