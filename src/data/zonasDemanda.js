/**
 * GRADE DE ZONAS + SIMULADOR DE DEMANDA
 * =====================================
 *
 * COMO O APP REAL FAZ
 * -------------------
 * O Uber não guarda "preço por bairro". Ele divide o mundo inteiro numa grade
 * de células fixas e mede oferta/demanda dentro de cada célula. A biblioteca
 * que eles criaram para isso se chama **H3** e usa HEXÁGONOS.
 *
 * Por que hexágono e não quadrado?
 *   - Todo vizinho de um hexágono está à MESMA distância do centro (6 vizinhos
 *     equidistantes). Num quadrado, o vizinho da diagonal está 41% mais longe
 *     que o vizinho do lado — isso distorce qualquer cálculo de "espalhar
 *     demanda para as células vizinhas".
 *   - Hexágonos não têm o efeito visual de "grade quadriculada" artificial.
 *
 * Aqui usamos QUADRADOS por um motivo didático: a matemática cabe em 20 linhas
 * e você enxerga o conceito. No exercício 4 do README você troca por hexágonos.
 *
 * IMPORTANTE: aqui tudo é simulado no aparelho. No app real, esses números vêm
 * do servidor, que agrega os pedidos de milhares de passageiros por segundo.
 */

/** Quantos metros tem 1 grau de latitude (constante) */
const METROS_POR_GRAU_LAT = 111320;

/**
 * Gera uma grade quadrada de células ao redor de um ponto central.
 *
 * @param {{latitude:number, longitude:number}} centro
 * @param {number} raioCelulas  quantas células para cada lado (4 → grade 9x9)
 * @param {number} tamanhoMetros lado de cada célula em metros
 */
export function gerarGrade(centro, { raioCelulas = 4, tamanhoMetros = 700 } = {}) {
  // Converter metros → graus.
  // Latitude é fácil: constante. Longitude "encolhe" conforme você se afasta do
  // equador, por isso multiplicamos pelo cosseno da latitude.
  const passoLat = tamanhoMetros / METROS_POR_GRAU_LAT;
  const passoLng =
    tamanhoMetros / (METROS_POR_GRAU_LAT * Math.cos((centro.latitude * Math.PI) / 180));

  const celulas = [];

  for (let i = -raioCelulas; i <= raioCelulas; i++) {
    for (let j = -raioCelulas; j <= raioCelulas; j++) {
      const lat = centro.latitude + i * passoLat;
      const lng = centro.longitude + j * passoLng;

      const meioLat = passoLat / 2;
      const meioLng = passoLng / 2;

      celulas.push({
        id: `${i}:${j}`,
        centro: { latitude: lat, longitude: lng },
        // Os 4 cantos do quadrado — é isso que o <Polygon> desenha.
        poligono: [
          { latitude: lat - meioLat, longitude: lng - meioLng },
          { latitude: lat - meioLat, longitude: lng + meioLng },
          { latitude: lat + meioLat, longitude: lng + meioLng },
          { latitude: lat + meioLat, longitude: lng - meioLng },
        ],
        // Distância (em células) até o centro da grade. Usamos para simular
        // que o centro da cidade costuma ter mais movimento que a periferia.
        distanciaCentro: Math.sqrt(i * i + j * j),
      });
    }
  }

  return celulas;
}

/**
 * Gerador pseudo-aleatório DETERMINÍSTICO.
 * Math.random() daria um valor diferente a cada render e a grade ficaria
 * "piscando". Aqui, a mesma semente sempre devolve o mesmo número — o mapa
 * fica estável e o comportamento é reproduzível (ótimo para testar).
 */
function ruido(semente) {
  const x = Math.sin(semente * 12.9898) * 43758.5453;
  return x - Math.floor(x); // resultado entre 0 e 1
}

/** Converte o id "3:-2" em um número estável para usar como semente. */
function sementeDaCelula(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 100000;
  return h;
}

/**
 * Curva de movimento ao longo do dia (0..1).
 * Dois picos: manhã (~8h) e fim de tarde (~18h) — o padrão clássico de
 * mobilidade urbana. Madrugada tem pouco movimento, exceto sexta/sábado.
 */
export function fatorHorario(hora) {
  const picoManha = Math.exp(-((hora - 8) ** 2) / 4);
  const picoTarde = Math.exp(-((hora - 18) ** 2) / 6);
  const base = 0.45;
  return Math.min(1, base + 0.75 * Math.max(picoManha, picoTarde));
}

/**
 * SIMULA a oferta e a demanda de cada célula num instante do tempo.
 *
 * @param celulas  saída de gerarGrade()
 * @param tick     contador que você incrementa a cada N segundos. É o que faz
 *                 a demanda "andar" pelo mapa, criando e desfazendo focos.
 * @param hora     hora do dia (0-23) para aplicar a curva de movimento
 * @returns array de { id, pedidos, motoristas, poligono, centro }
 */
export function simularDemanda(celulas, tick, hora = new Date().getHours()) {
  const movimentoDoDia = fatorHorario(hora);

  return celulas.map((celula) => {
    const s = sementeDaCelula(celula.id);

    // "Vocação" da célula: um shopping tem sempre mais pedidos que uma rua
    // residencial. Valor fixo, não muda com o tempo.
    const vocacao = 0.3 + 0.7 * ruido(s);

    // Decaimento pela distância do centro da cidade.
    const decaimento = Math.exp(-celula.distanciaCentro / 4);

    // Onda que se desloca: faz focos de demanda nascerem e morrerem.
    // Cada célula tem uma fase diferente (ruido), então elas não pulsam juntas.
    // O expoente 2 deixa os picos mais ESTREITOS — em vez de a cidade inteira
    // ficar morna, surgem focos concentrados, que é o padrão real.
    const fase = ruido(s + 7) * Math.PI * 2;
    const onda = (t) =>
      Math.pow(0.5 + 0.5 * Math.sin(t / 6 + fase + celula.distanciaCentro / 2), 2);

    const base = vocacao * decaimento * movimentoDoDia;

    // ---- AQUI ESTÁ O CORAÇÃO DO SURGE ----
    // A demanda usa a onda no tempo ATUAL.
    // A oferta usa a onda ATRASADA em ATRASO ticks: motoristas levam tempo
    // para perceber o movimento e chegar até lá. Esse atraso entre demanda e
    // oferta é literalmente o que cria escassez — e, portanto, preço alto.
    // Experimente colocar ATRASO = 0 e veja o surge quase desaparecer.
    const ATRASO = 5;
    const intensidadeDemanda = base * onda(tick);
    const intensidadeOferta = base * onda(tick - ATRASO);

    // Passageiros pedindo carro agora nesta célula.
    const pedidos = Math.round(intensidadeDemanda * 55);

    // Motoristas disponíveis (nunca zero: sempre há alguém passando).
    const motoristas = Math.max(
      1,
      Math.round(intensidadeOferta * 26 + 2 * ruido(s + 13) + 1)
    );

    return {
      id: celula.id,
      poligono: celula.poligono,
      centro: celula.centro,
      pedidos,
      motoristas,
    };
  });
}
