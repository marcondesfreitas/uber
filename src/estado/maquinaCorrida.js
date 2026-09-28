/**
 * MÁQUINA DE ESTADOS DA CORRIDA
 * =============================
 *
 * O CONCEITO, EM UMA FRASE
 * ------------------------
 * Em vez de espalhar `if (aceitou && !cancelou && chegou)` pela interface,
 * você declara: quais ESTADOS existem, e quais EVENTOS levam de um ao outro.
 * Tudo que não está na tabela é impossível — e essa é a parte que salva o app.
 *
 * POR QUE ISSO IMPORTA AQUI
 * -------------------------
 * O fluxo de uma corrida tem uma armadilha clássica: o motorista toca
 * "Aceitar" no mesmo instante em que a contagem regressiva chega a zero.
 * Com `if`s soltos, os dois caminhos rodam e o app fica num estado que ninguém
 * previu (aceitou uma corrida que já expirou). Com a tabela abaixo, o segundo
 * evento simplesmente não tem para onde ir a partir do novo estado, e é
 * ignorado. O bug deixa de ser possível em vez de ser "tratado".
 *
 * Os nomes dos estados são exatamente os do ROADMAP.md, Módulo 2:
 *   ociosa → recebida → indo_buscar → aguardando → em_viagem → finalizada
 */

export const ESTADOS = [
  'ociosa',       // online, procurando viagens
  'recebida',     // solicitação na tela, contagem correndo
  'indo_buscar',  // a caminho do passageiro
  'aguardando',   // no local, esperando o passageiro entrar
  'em_viagem',    // levando o passageiro ao destino
  'finalizada',   // corrida encerrada, mostrando o resumo
];

/**
 * A TABELA. Leia como: "estando em X, o evento E me leva para Y".
 * O que não está aqui não acontece.
 */
export const TRANSICOES = {
  ociosa: { RECEBER: 'recebida' },
  recebida: { ACEITAR: 'indo_buscar', RECUSAR: 'ociosa', EXPIRAR: 'ociosa' },
  indo_buscar: { CHEGUEI: 'aguardando', CANCELAR: 'ociosa' },
  aguardando: { INICIAR: 'em_viagem', CANCELAR: 'ociosa' },
  em_viagem: { FINALIZAR: 'finalizada' },
  finalizada: { REINICIAR: 'ociosa' },
};

/**
 * Aplica um evento. Devolve o MESMO estado se a transição não existir —
 * nunca `undefined`, nunca uma exceção. Uma máquina de estados que quebra o
 * app quando recebe um evento inesperado não protegeu nada.
 */
export function transitar(estadoAtual, evento) {
  const destinos = TRANSICOES[estadoAtual];
  if (!destinos) return estadoAtual;
  return destinos[evento] ?? estadoAtual;
}

/** Serve para desabilitar botões: "este evento é válido agora?" */
export function podeTransitar(estadoAtual, evento) {
  return Boolean(TRANSICOES[estadoAtual] && TRANSICOES[estadoAtual][evento]);
}

/**
 * Durante estes estados o motorista tem UMA tarefa. A tab bar some, o mapa
 * ocupa a tela inteira e a superfície clara flutua por cima (§1, "dois mundos").
 */
export function emCorrida(estado) {
  return estado !== 'ociosa' && estado !== 'finalizada';
}

/** Segundos de contagem regressiva da solicitação (§5.13). */
export const SEGUNDOS_CONTAGEM = 12;

/** Espera gratuita antes de começar a cobrar (§5.14). */
export const SEGUNDOS_ESPERA_GRATIS = 120;
