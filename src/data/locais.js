/**
 * COORDENADAS DO PROTÓTIPO (Fortaleza - CE)
 * =========================================
 * A especificação foi feita a partir de um tour gravado em Fortaleza, então o
 * mapa nasce lá em vez de em São Paulo. Enquanto o GPS não responde — ou
 * quando você roda no emulador, que costuma ficar na Califórnia — é esta a
 * região mostrada.
 *
 * ⚠️ São pontos APROXIMADOS, escolhidos para os endereços fictícios do §7.1
 * caírem em bairros plausíveis. Não use para navegação de verdade.
 */

/** Centro da operação: Aldeota / Dionísio Torres. */
export const CENTRO_FORTALEZA = { latitude: -3.744, longitude: -38.502 };

export const REGIAO_PADRAO = {
  ...CENTRO_FORTALEZA,
  // Delta ≈ quanto do mundo cabe na tela. 0,02° ≈ 2,2 km de altura: perto o
  // bastante para ver ruas, longe o bastante para ver zonas de demanda.
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

/** Retirada: Av. Historiador Raimundo Girão, 800 - Praia de Iracema. */
export const PONTO_RETIRADA = { latitude: -3.7215, longitude: -38.5145 };

/** Destino: Aeroporto Pinto Martins - Serrinha. */
export const PONTO_DESTINO = { latitude: -3.7762, longitude: -38.532 };

/**
 * Rota desenhada com <Polyline>.
 *
 * No app real esta lista vem de uma API de rotas (Google Directions, OSRM) e
 * tem centenas de pontos acompanhando cada curva da rua. Aqui são poucos
 * vértices escolhidos à mão — o suficiente para a linha não atravessar
 * quarteirões em diagonal, que é o que denuncia uma rota falsa.
 */
/** Aldeota → Praia de Iracema, subindo pela Des. Moreira até a Beira-Mar. */
export const ROTA_ATE_RETIRADA = [
  CENTRO_FORTALEZA,
  { latitude: -3.7385, longitude: -38.5065 },
  { latitude: -3.7315, longitude: -38.5105 },
  { latitude: -3.7262, longitude: -38.5128 },
  PONTO_RETIRADA,
];

/** Praia de Iracema → Aeroporto, cortando o Centro e descendo a Aguanambi. */
export const ROTA_ATE_DESTINO = [
  PONTO_RETIRADA,
  { latitude: -3.7268, longitude: -38.5218 },
  { latitude: -3.7355, longitude: -38.5288 },
  { latitude: -3.7492, longitude: -38.5325 },
  { latitude: -3.7625, longitude: -38.5338 },
  PONTO_DESTINO,
];

/**
 * A VIAGEM INTEIRA, mostrada enquanto a oferta está na tela.
 *
 * O motorista tem 12 segundos para decidir, e a pergunta que ele faz é "vale
 * a pena?". Isso depende tanto de onde ele vai BUSCAR quanto de onde vai
 * PARAR — uma corrida curta que termina longe de tudo é ruim mesmo pagando
 * bem. Mostrar só o trecho até a retirada esconderia metade da decisão.
 *
 * `slice(1)` porque o ponto de retirada é o fim de uma rota e o começo da
 * outra: sem isso ele entra duas vezes seguidas na linha. Não quebraria o
 * desenho, mas duplicar vértice é o tipo de detalhe que confunde quem for
 * medir a distância depois.
 */
export const ROTA_DA_OFERTA = [...ROTA_ATE_RETIRADA, ...ROTA_ATE_DESTINO.slice(1)];

const RAIO_TERRA_KM = 6371;
const rad = (g) => (g * Math.PI) / 180;

/**
 * Comprimento de uma rota em quilômetros, somando trecho a trecho.
 *
 * POR QUE MEDIR EM VEZ DE ESCREVER O NÚMERO
 * -----------------------------------------
 * As distâncias do cartão da solicitação eram texto solto ('2,3 km'). Enquanto
 * ninguém mexia nas coordenadas, tudo bem — mas no dia em que a rota mudou, o
 * mapa passou a mostrar uma viagem e o cartão a anunciar outra. Duas fontes
 * para o mesmo fato sempre acabam discordando; medindo, é impossível.
 *
 * Usa a fórmula de haversine, que trata a Terra como esfera. Numa corrida
 * urbana o erro é de centímetros, e ela evita a armadilha de tratar graus de
 * latitude e longitude como se valessem a mesma distância — perto do equador,
 * como Fortaleza, dá quase certo; longe dele, erra feio.
 *
 * O resultado é a distância da LINHA DESENHADA, não a de rua de verdade: a
 * rota do protótipo tem poucos vértices, então ela corta algumas curvas. É a
 * mesma linha que o motorista vê no mapa, que é o que importa aqui.
 */
export function distanciaKm(pontos) {
  let total = 0;
  for (let i = 1; i < pontos.length; i++) {
    const a = pontos[i - 1];
    const b = pontos[i];
    const dLat = rad(b.latitude - a.latitude);
    const dLon = rad(b.longitude - a.longitude);
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2;
    total += 2 * RAIO_TERRA_KM * Math.asin(Math.sqrt(h));
  }
  return total;
}
