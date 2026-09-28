/**
 * CATÁLOGO DE AVISOS TÉCNICOS
 * ===========================
 *
 * Este projeto é uma reimplementação didática, feita do zero, de um app de
 * mobilidade. Em vários pontos ele simplifica ou simula algo que o sistema real
 * faz de outro jeito. Em vez de esconder essas simplificações, nós as
 * DOCUMENTAMOS NA PRÓPRIA TELA.
 *
 * Por que isso é uma boa prática (e não só burocracia):
 *
 *  - Num TCC ou apresentação, quem avalia sempre pergunta "isso é real ou
 *    simulado?". Ter a resposta na tela mostra domínio, não fraqueza.
 *  - Rotular o que é mock evita que você mesmo esqueça, daqui a dois meses,
 *    que aquele número bonito vem de um `Math.sin`.
 *  - É o mesmo padrão que apps sérios usam: "dados podem estar atrasados",
 *    "estimativa", "versão beta".
 *
 * SOBRE PROPRIEDADE INTELECTUAL, EM UMA NOTA:
 * Funcionalidade e padrões de interface não são protegidos por direito autoral —
 * recriar mapa, preço dinâmico e fluxo de corrida é livre. O que pertence à
 * empresa original é a MARCA (nome, logo, identidade visual), os ícones e os
 * sons. Por isso este app tem nome próprio, paleta própria e sons próprios.
 * Não é uma limitação do aprendizado: é o que separa "clone" de "plágio".
 */

export const CATEGORIAS = {
  SIMULACAO: 'Simulação',
  SIMPLIFICACAO: 'Simplificação',
  MARCA: 'Marca e identidade',
  PRIVACIDADE: 'Privacidade e dados',
};

/**
 * Cada aviso tem:
 *  id       - chave estável
 *  titulo   - frase curta que aparece na lista
 *  detalhe  - explicação técnica
 *  real     - como o sistema de produção resolve isso
 *  categoria
 */
export const AVISOS = {
  IDENTIDADE_PROPRIA: {
    id: 'IDENTIDADE_PROPRIA',
    categoria: CATEGORIAS.MARCA,
    titulo: 'Identidade visual original, sem marca de terceiros',
    detalhe:
      'Nome, paleta, ícones e sons deste app foram criados para o projeto. ' +
      'Nenhum ativo gráfico ou sonoro de aplicativo comercial é utilizado.',
    real:
      'Recriar funcionalidades e padrões de interface é livre; a marca, o logo ' +
      'e os ativos originais são propriedade da empresa que os criou.',
  },

  DADOS_SIMULADOS: {
    id: 'DADOS_SIMULADOS',
    categoria: CATEGORIAS.SIMULACAO,
    titulo: 'Corridas e passageiros são fictícios',
    detalhe:
      'Não existe servidor nem banco de dados. Passageiros, corridas e valores ' +
      'são gerados no próprio aparelho por funções determinísticas.',
    real:
      'Uma plataforma real casa pedidos e motoristas num servidor de matching, ' +
      'com filas por região e milhares de eventos por segundo.',
  },

  DEMANDA_SIMULADA: {
    id: 'DEMANDA_SIMULADA',
    categoria: CATEGORIAS.SIMULACAO,
    titulo: 'Mapa de demanda gerado por simulação',
    detalhe:
      'Os pedidos e a quantidade de motoristas por zona vêm de uma onda ' +
      'senoidal com semente fixa (src/data/zonasDemanda.js), não de dados reais. ' +
      'A oferta usa a onda atrasada em 5 ciclos para reproduzir o atraso ' +
      'oferta-demanda que gera escassez.',
    real:
      'A plataforma agrega pedidos reais por célula geográfica e usa modelos ' +
      'preditivos com histórico, clima, eventos e trânsito.',
  },

  SURGE_SIMPLIFICADO: {
    id: 'SURGE_SIMPLIFICADO',
    categoria: CATEGORIAS.SIMPLIFICACAO,
    titulo: 'Preço dinâmico com modelo simplificado',
    detalhe:
      'Multiplicador = (pedidos ÷ motoristas) ^ 0,55, com média exponencial, ' +
      'zona morta em 1,2x e teto em 3,0x. Valores em reais são fictícios e não ' +
      'correspondem a nenhuma tabela tarifária real.',
    real:
      'Sistemas de produção combinam elasticidade de preço por região, ' +
      'incentivos direcionados e limites regulatórios que desligam o aumento ' +
      'durante emergências.',
  },

  GRADE_QUADRADA: {
    id: 'GRADE_QUADRADA',
    categoria: CATEGORIAS.SIMPLIFICACAO,
    titulo: 'Grade de células quadradas em vez de hexagonais',
    detalhe:
      'Usamos quadrados de 700 m porque a matemática cabe em poucas linhas e ' +
      'fica visível no código.',
    real:
      'A indústria usa grades hexagonais (o padrão aberto H3): os seis vizinhos ' +
      'são equidistantes do centro, o que evita distorção ao espalhar demanda.',
  },

  MAPA_PROVEDOR: {
    id: 'MAPA_PROVEDOR',
    categoria: CATEGORIAS.SIMPLIFICACAO,
    titulo: 'Mapa base de provedor externo, sem chave dedicada',
    detalhe:
      'A renderização do mapa usa o provedor do sistema operacional através da ' +
      'biblioteca react-native-maps. Em produção seria necessária chave de API ' +
      'própria, com cotas e custo por requisição.',
    real:
      'Aplicativos comerciais contratam o serviço de mapas, roteirização e ' +
      'geocodificação, com contrato e limites de uso.',
  },

  GPS_PRIMEIRO_PLANO: {
    id: 'GPS_PRIMEIRO_PLANO',
    categoria: CATEGORIAS.SIMPLIFICACAO,
    titulo: 'Localização apenas com o app aberto',
    detalhe:
      'Usamos permissão de primeiro plano. Ao minimizar o app, o rastreamento para.',
    real:
      'Apps de motorista pedem permissão de segundo plano e rodam um serviço ' +
      'em primeiro plano com notificação persistente durante a corrida.',
  },

  BIOMETRIA_LOCAL: {
    id: 'BIOMETRIA_LOCAL',
    categoria: CATEGORIAS.PRIVACIDADE,
    titulo: 'Verificação facial apenas demonstrativa',
    detalhe:
      'A conferência de rosto é encenada: nenhuma imagem é enviada, comparada ' +
      'ou armazenada fora do aparelho, e não há reconhecimento facial real.',
    real:
      'Verificação biométrica de verdade envolve prova de vida, comparação com ' +
      'documento e tratamento de dado sensível sob a LGPD, com base legal, ' +
      'retenção definida e avaliação de viés algorítmico.',
  },
};

/**
 * Decide quais avisos estão relevantes AGORA.
 * Mostrar oito avisos o tempo todo é o mesmo que não mostrar nenhum — vira
 * aquele texto que ninguém lê. A lista muda conforme o que está em uso.
 */
export function avisosAtivos({ demandaVisivel = false, camera = false } = {}) {
  const lista = [AVISOS.IDENTIDADE_PROPRIA, AVISOS.DADOS_SIMULADOS, AVISOS.MAPA_PROVEDOR, AVISOS.GPS_PRIMEIRO_PLANO];

  if (demandaVisivel) {
    lista.push(AVISOS.DEMANDA_SIMULADA, AVISOS.SURGE_SIMPLIFICADO, AVISOS.GRADE_QUADRADA);
  }
  if (camera) {
    lista.push(AVISOS.BIOMETRIA_LOCAL);
  }

  return lista;
}
