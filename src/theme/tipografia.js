/**
 * ESCALA TIPOGRÁFICA (§2.3 do SYSTEM-DESIGN.md)
 * =============================================
 * Uma escala é uma lista CURTA de tamanhos permitidos. Sete degraus, não vinte.
 *
 * Por que isso importa: quando cada tela escolhe seu próprio `fontSize: 19`,
 * o app perde ritmo e ninguém consegue mais dizer o que é título e o que é
 * legenda. A escala transforma "que tamanho eu uso aqui?" em "qual o PAPEL
 * deste texto?" — uma pergunta que tem resposta.
 *
 * A ARMADILHA DO `fontWeight` COM FONTE CUSTOMIZADA
 * -------------------------------------------------
 * Este é o erro nº 1 de quem carrega uma fonte no React Native, e ele é
 * SILENCIOSO — o texto aparece, só que errado.
 *
 * Com a fonte do sistema, `fontWeight: '800'` funciona: o sistema tem todos os
 * pesos e escolhe o certo. Com uma fonte carregada por arquivo, cada peso é um
 * ARQUIVO SEPARADO, registrado com seu próprio nome:
 *
 *     Inter_400Regular   Inter_500Medium   Inter_600SemiBold
 *     Inter_700Bold      Inter_800ExtraBold
 *
 * Pedir `fontFamily: 'Inter_400Regular'` + `fontWeight: '800'` não engrossa
 * nada — no Android o peso é simplesmente ignorado; no iOS ele às vezes gera
 * um negrito sintético, esticado e feio. O peso PRECISA vir pelo nome da
 * família.
 *
 * Por isso nenhum token daqui usa `fontWeight`. Se você precisar de um peso
 * diferente num lugar específico, troque a `fontFamily` — nunca acrescente
 * `fontWeight` por cima.
 */

/** Os cinco arquivos da Inter que o app carrega. Peso = família, não `fontWeight`. */
export const familia = {
  regular: 'Inter_400Regular',
  media: 'Inter_500Medium',
  semi: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extra: 'Inter_800ExtraBold',
};

/**
 * Números de dinheiro SEMPRE com tabular-nums.
 * Sem isso, "R$ 9,72" e "R$ 11,08" têm larguras diferentes e o valor
 * "pula" horizontalmente quando muda — o que é péssimo justamente na tela
 * de ganho parcial, onde o número muda a cada 350 ms.
 */
export const numerico = { fontVariant: ['tabular-nums'] };

export const tipo = {
  /** Valor da corrida — o maior número do app */
  display: { fontFamily: familia.extra, fontSize: 34, lineHeight: 40, letterSpacing: -1 },

  /** Título de tela: "Conta", "Ganhos", "Fortaleza: ganhos altos hoje" */
  h1: { fontFamily: familia.extra, fontSize: 26, lineHeight: 32, letterSpacing: -0.65 },

  /** Título de seção e valor da semana */
  h2: { fontFamily: familia.bold, fontSize: 20, lineHeight: 26, letterSpacing: -0.4 },

  /** Título de linha de lista e header de tela */
  h3: { fontFamily: familia.bold, fontSize: 17, lineHeight: 22 },

  /** Texto descritivo */
  corpo: { fontFamily: familia.regular, fontSize: 15, lineHeight: 21 },

  /** Rótulo de campo, item de menu */
  corpoForte: { fontFamily: familia.semi, fontSize: 15, lineHeight: 21 },

  /** Subtítulo, valor de linha */
  legenda: { fontFamily: familia.media, fontSize: 13, lineHeight: 18 },

  /** Tab bar, pills, badges */
  micro: { fontFamily: familia.semi, fontSize: 11, lineHeight: 14 },

  /** Cabeçalho de seção em versalete — o "TÍTULO PEQUENO" do app */
  secao: {
    fontFamily: familia.bold,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
};

/**
 * FORMATADORES pt-BR (§7.2)
 * -------------------------
 * Centralizados aqui pelo mesmo motivo das cores: `valor.toFixed(2)` espalhado
 * pelo app produz "R$ 9.72" com PONTO em alguma tela esquecida. Formatação de
 * moeda é regra de negócio, não detalhe de layout.
 */

/** 9.72 → "R$ 9,72" */
export function brl(valor) {
  return 'R$ ' + Number(valor).toFixed(2).replace('.', ',');
}

/** 1.8 → "1,8x" */
export function multiplicador(m) {
  return Number(m).toFixed(1).replace('.', ',') + 'x';
}

/** 3.8 → "3,8 km" */
export function km(valor) {
  return Number(valor).toFixed(1).replace('.', ',') + ' km';
}

/** 47 → "0:47" (cronômetro de espera) */
export function cronometro(segundos) {
  const m = Math.floor(segundos / 60);
  const s = String(Math.floor(segundos) % 60).padStart(2, '0');
  return `${m}:${s}`;
}
