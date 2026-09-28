/**
 * PREÇO DINÂMICO (SURGE PRICING)
 * ==============================
 *
 * A IDEIA CENTRAL, EM UMA FRASE
 * -----------------------------
 * Quando há mais gente pedindo carro do que carros disponíveis, o preço sobe.
 * Isso faz duas coisas ao mesmo tempo:
 *   1) reduz a demanda (quem não tem pressa desiste ou espera);
 *   2) aumenta a oferta (motoristas se deslocam para a zona cara).
 * O sistema volta ao equilíbrio sozinho. É um mecanismo de controle com
 * realimentação — o mesmo princípio de um termostato.
 *
 * A MATEMÁTICA
 * ------------
 *   razão = pedidos / motoristas
 *   multiplicador = razão ^ ALFA,  limitado entre 1.0 e TETO
 *
 * Por que elevar a um expoente < 1 em vez de usar a razão direta?
 * Porque a razão direta é agressiva demais: 4 pedidos para 1 motorista viraria
 * 4.0x. Com ALFA = 0.55, vira ~2.2x. A curva cresce rápido no começo e vai
 * achatando — é o comportamento que você quer em qualquer preço.
 *
 * TRÊS CUIDADOS QUE TODO SISTEMA REAL TEM (e que a fórmula sozinha não dá):
 *
 *  1. SUAVIZAÇÃO TEMPORAL (EMA). Sem ela o multiplicador oscila a cada
 *     atualização e o motorista vê 1.8x → 1.1x → 2.0x em 10 segundos. Ninguém
 *     confia num preço assim. A média exponencial dá inércia ao número.
 *
 *  2. ZONA MORTA. Abaixo de um limiar (aqui 1.2x) o preço volta para 1.0x.
 *     Um "surge de 1.05x" é ruído estatístico, não escassez real.
 *
 *  3. TETO. Limite de quanto o preço pode subir. Isso é decisão de produto E
 *     obrigação legal: durante emergências (atentados, desastres), cobrar 5x
 *     é ilegal em várias jurisdições — a lei chama de "price gouging". Empresas
 *     de mobilidade já foram processadas por não desligar o surge nessas horas.
 *     Se você for escrever isso no TCC, esse é um ótimo parágrafo.
 */

export const ALFA = 0.55;      // achatamento da curva
export const TETO = 3.0;       // multiplicador máximo
export const PISO_VISIVEL = 1.2; // abaixo disso, mostramos 1.0x (zona morta)
export const SUAVIZACAO = 0.25;  // peso do valor novo na média (0..1)

/**
 * Calcula o multiplicador bruto de uma célula (sem suavização).
 */
export function multiplicadorBruto({ pedidos, motoristas }) {
  const oferta = Math.max(motoristas, 1);
  const razao = pedidos / oferta;
  if (razao <= 1) return 1;
  const bruto = Math.pow(razao, ALFA);
  return Math.min(bruto, TETO);
}

/**
 * Aplica a média móvel exponencial (EMA) sobre o valor anterior.
 *
 *   novo = anterior + peso * (medido - anterior)
 *
 * Com peso 0.25, cada atualização move o número só 25% em direção ao alvo:
 * ele persegue a realidade, mas sem sobressaltos.
 */
export function suavizar(anterior, medido, peso = SUAVIZACAO) {
  if (anterior == null) return medido;
  return anterior + peso * (medido - anterior);
}

/**
 * Arredonda para o "degrau" comercial mais próximo (1.0, 1.1, 1.2 …).
 * Preço quebrado tipo 1.8734x passa impressão de instabilidade.
 */
export function arredondarDegrau(valor, degrau = 0.1) {
  return Math.round(valor / degrau) * degrau;
}

/**
 * Pipeline completo: recebe as células simuladas e o estado anterior,
 * devolve as células com multiplicador final + nível visual.
 *
 * @param celulas   saída de simularDemanda()
 * @param anteriores Map<id, multiplicador> da rodada passada (para a EMA)
 */
export function calcularSurge(celulas, anteriores = new Map()) {
  const novosEstados = new Map();

  const resultado = celulas.map((c) => {
    const bruto = multiplicadorBruto(c);
    const suave = suavizar(anteriores.get(c.id), bruto);
    novosEstados.set(c.id, suave);

    // Zona morta + arredondamento só na EXIBIÇÃO.
    // O estado interno guarda o valor contínuo, senão a EMA trava nos degraus.
    const exibido = suave < PISO_VISIVEL ? 1 : arredondarDegrau(suave);

    return {
      ...c,
      multiplicador: exibido,
      multiplicadorInterno: suave,
      nivel: nivelDoMultiplicador(exibido),
    };
  });

  return { celulas: resultado, estados: novosEstados };
}

/**
 * Traduz o multiplicador em um nível visual (0 a 5).
 * Separar "número" de "cor" evita espalhar `if` de cor pela interface inteira.
 *
 * Por que SEIS degraus e não quatro? Porque com quatro, tudo acima de 2,0x
 * virava a mesma cor — e a diferença entre "2,1x" e "2,9x" é exatamente a
 * informação que faz o motorista decidir atravessar a cidade. A rampa da
 * §2.2 do SYSTEM-DESIGN.md quebra essa faixa em três.
 */
export function nivelDoMultiplicador(m) {
  if (m < PISO_VISIVEL) return 0;  // < 1,2x — ruído estatístico, não mostramos
  if (m < 1.5) return 1;
  if (m < 1.8) return 2;
  if (m < 2.1) return 3;
  if (m < 2.5) return 4;
  return 5;
}

/**
 * Paleta da camada de demanda — a assinatura visual do app.
 *
 * Escolha de cores com intenção:
 *  - Nível 0 é INVISÍVEL (transparente). Pintar o mapa inteiro para dizer
 *    "aqui não tem nada" é poluição visual.
 *  - A rampa vai de amarelo a roxo, crescendo em intensidade PERCEBIDA e não
 *    só em matiz. Ela continua legível para daltonismo de vermelho-verde
 *    porque evitamos o par verde↔vermelho e porque a opacidade sobe a cada
 *    degrau — quem não distingue o matiz ainda lê a densidade.
 *  - O preenchimento é bem transparente para as ruas continuarem legíveis
 *    por baixo. Camada de dado nunca deve matar o mapa.
 *  - `eta` é o tempo típico até o próximo pedido naquele nível. É o que vai
 *    na pill flutuante ("↗ 1-4 min"): o motorista pensa em MINUTOS DE ESPERA,
 *    não em multiplicador. O número técnico fica no card da zona.
 */
export const PALETA_DEMANDA = [
  { preenchimento: 'transparent',           borda: 'transparent',           rotulo: 'Normal',       eta: null,      base: null },
  { preenchimento: 'rgba(242,179,61,0.20)', borda: 'rgba(242,179,61,0.48)', rotulo: 'Movimentado',  eta: '5-9 min', base: '242,179,61' },
  { preenchimento: 'rgba(232,135,58,0.28)', borda: 'rgba(232,135,58,0.56)', rotulo: 'Alta demanda', eta: '4-7 min', base: '232,135,58' },
  { preenchimento: 'rgba(217,72,75,0.34)',  borda: 'rgba(217,72,75,0.62)',  rotulo: 'Muito alta',   eta: '2-5 min', base: '217,72,75' },
  { preenchimento: 'rgba(168,50,125,0.40)', borda: 'rgba(168,50,125,0.68)', rotulo: 'Pico',         eta: '1-4 min', base: '168,50,125' },
  { preenchimento: 'rgba(110,43,181,0.46)', borda: 'rgba(110,43,181,0.74)', rotulo: 'Pico extremo', eta: '1-3 min', base: '110,43,181' },
];

/** Cor cheia (100% opaca) do nível — usada nas pills de ETA sobre o mapa. */
export function corSolida(nivel) {
  const faixa = PALETA_DEMANDA[nivel];
  return faixa && faixa.base ? 'rgb(' + faixa.base + ')' : 'transparent';
}

/** Formata para exibir: 1.8 → "1.8x" */
export function formatarMultiplicador(m) {
  return `${m.toFixed(1)}x`;
}

/**
 * Ganho estimado do motorista numa corrida daquela zona.
 * Tarifa fictícia só para dar significado ao número na tela.
 */
export function estimarGanho(multiplicador, { base = 7.5, porKm = 2.1, km = 4 } = {}) {
  return (base + porKm * km) * multiplicador;
}
