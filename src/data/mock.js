/**
 * DADOS MOCK (§7.1 do SYSTEM-DESIGN.md)
 * =====================================
 *
 * Um arquivo só, com TODOS os dados falsos do protótipo.
 *
 * Por que centralizar em vez de escrever "Luciano" em oito telas:
 *  - consistência: o nome no menu, no perfil e nos dados pessoais é o MESMO
 *    literal, então nunca dessincroniza;
 *  - é o ponto de troca: no Módulo 6, quando os dados vierem de um servidor,
 *    você substitui este arquivo por chamadas de rede e as telas não mudam.
 *
 * DE ONDE VÊM ESTES VALORES
 * -------------------------
 * Foram lidos quadro a quadro da gravação de tela em `SYSTEM-DESIGN.md`, para
 * o protótipo bater com o vídeo na apresentação.
 *
 * ⚠️ E-mail e telefone abaixo são os que aparecem NA GRAVAÇÃO — ou seja, dados
 * de uma conta real. Eles ficam isolados aqui de propósito: se este repositório
 * for para o GitHub ou o app for publicado, troque os dois por valores
 * fictícios antes. Um endereço de e-mail em código versionado não sai mais de
 * lá, mesmo depois de apagado.
 *
 * O resto (corrida, endereços de retirada e destino, ganhos) é ficção didática:
 * plausível para Fortaleza/CE, mas não é nenhuma viagem real.
 */

import { ROTA_ATE_DESTINO, ROTA_ATE_RETIRADA, distanciaKm } from './locais';

export const motorista = {
  nome: 'Luciano',
  nota: 5.0,
  cidade: 'Belo Horizonte',        // cidade do PERFIL público
  cidadeOperacao: 'Fortaleza',     // onde ele dirige hoje
  bio: 'Simpático e educado',
  idiomas: ['Português', 'Inglês', 'Espanhol'],
  viagens: 0,
  anos: 0,
  nivel: 'Pro Azul',
  email: 'centralcontas01@gmail.com',
  telefone: '+ 11953373238',
  genero: 'Homem',
  idioma: 'Português (Brasil)',
};

export const veiculos = {
  carro: { tipo: 'carro', modelo: 'VOLKSWAGEN VOYAGE 1.0', placa: 'HNS2665', cor: 'PRETA' },
  moto: { tipo: 'moto', modelo: 'MOTTU SPORT 110i', placa: 'TBE5A94', cor: 'VERMELHA' },
};

/**
 * As ilustrações de cada tipo de veículo, com fundo transparente.
 *
 * Moram AQUI, e não em cada tela, porque duas telas as usam — os cards de
 * "Gerenciar veículos" e a vitrine de "Veículos". Duplicar os `require` em
 * cada uma funcionaria hoje e sairia do ar no dia em que a arte mudasse e
 * alguém atualizasse só um dos lados.
 *
 * São GERADAS por `scripts/gerar-veiculos.js` a partir dos originais em
 * `assets/veiculos/*-fonte.*`, que vêm sobre fundo branco. Para trocar a arte,
 * substitua a origem e rode o script — não edite os PNGs à mão.
 */
export const ilustracoesVeiculo = {
  carro: require('../../assets/veiculos/carro.png'),
  moto: require('../../assets/veiculos/moto.png'),
};

/** A semana começa vazia de propósito: é o estado real de quem acabou de
 *  instalar o app. O botão "Mais informações" preenche com dados de exemplo
 *  para você conseguir desenhar as duas versões do gráfico (Módulo 4). */
export const semana = {
  periodo: '17 de ago. – 23 de ago.',
  vazia: { valor: 0, horas: 0, viagens: 0, pontos: 0 },
  comDados: { valor: 842.3, horas: 32, viagens: 47, pontos: 58 },
  // Altura relativa de cada barra (S T Q Q S S D). O sábado é "hoje".
  alturas: [42, 58, 30, 66, 48, 100, 22],
  dias: ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'],
  indiceHoje: 5,
};

/**
 * A CORRIDA DE EXEMPLO
 * ====================
 * Um único objeto atravessa a máquina de estados inteira: solicitação → indo
 * buscar → aguardando → em viagem → resumo.
 *
 * OS NÚMEROS SAEM DA ROTA DESENHADA
 * ---------------------------------
 * Distância e tempo eram texto escrito à mão ('2,3 km', '4 min'). Enquanto
 * ninguém mexia nas coordenadas parecia certo — mas no dia em que a rota
 * cresceu, o mapa passou a mostrar uma viagem e o cartão a anunciar outra.
 *
 * Medindo a própria linha, as duas não têm como discordar. O preço por km
 * também: ele é o valor dividido pelo que o motorista REALMENTE roda, indo
 * buscar mais viagem — que é a conta que decide se a corrida compensa.
 */
const VELOCIDADE_MEDIA_KMH = 24; // trânsito urbano de Fortaleza, com semáforos
const KM_RETIRADA = distanciaKm(ROTA_ATE_RETIRADA);
const KM_DESTINO = distanciaKm(ROTA_ATE_DESTINO);

const emMinutos = (km) => Math.max(1, Math.round((km / VELOCIDADE_MEDIA_KMH) * 60));
const emKm = (km) => `${km.toFixed(1).replace('.', ',')} km`;

const VALOR_CORRIDA = 9.72;

export const corridaExemplo = {
  servico: 'Flash+',
  valor: VALOR_CORRIDA,
  porKm: VALOR_CORRIDA / (KM_RETIRADA + KM_DESTINO),
  bonus: 1.01,
  gorjeta: 2.0,
  duracaoMin: emMinutos(KM_DESTINO),
  passageiro: { nome: 'Camila S.', nota: 4.9, avaliacoes: 386, verificado: true },
  retirada: {
    eta: `${emMinutos(KM_RETIRADA)} min`,
    dist: emKm(KM_RETIRADA),
    endereco: 'Av. Historiador Raimundo Girão, 800 - Praia de Iracema, Fortaleza - CE',
    curto: 'Av. Historiador Raimundo Girão, 800 - Praia de Iracema',
  },
  destino: {
    eta: `${emMinutos(KM_DESTINO)} minutos`,
    dist: emKm(KM_DESTINO),
    endereco: 'Aeroporto Pinto Martins - Av. Senador Carlos Jereissati, 3000, Fortaleza - CE',
    curto: 'Aeroporto Pinto Martins',
    bairro: 'Serrinha',
  },
};

/** Linhas da tela Conta. `destino` null = ainda não implementado (mostra toast). */
export const linhasConta = [
  { label: 'Portal de oportunidades', icone: 'work', destino: null },
  { label: 'Documentos', icone: 'description', destino: null },
  { label: 'Repasse de ganhos', icone: 'payments', destino: null },
  { label: 'Informações fiscais', icone: 'receipt_long', destino: null },
  { label: 'Gerenciar conta da Uber', icone: 'manage_accounts', destino: 'contaDados' },
  { label: 'Edite o endereço', icone: 'pin_drop', destino: null },
  { label: 'Seguro', icone: 'health_and_safety', destino: null },
  { label: 'Privacidade', icone: 'lock', destino: null },
  { label: 'Configurações do app', icone: 'settings', destino: null },
  { label: 'Sobre', icone: 'info', destino: 'designSystem' },
];

/** Itens do menu principal. */
export const linhasMenu = [
  { label: 'Indicações', destino: null },
  { label: 'Descubra', destino: null },
  { label: 'Uber Pro', destino: null },
  { label: 'Carteira', destino: null },
  { label: 'Conta', destino: 'conta' },
  { separador: true },
  { label: 'Ajuda', destino: null },
  { label: 'Informações', destino: 'designSystem' },
];

/** Cards de tipo de serviço da tela Preferências. */
/**
 * TIPOS DE SERVIÇO POR VEÍCULO (§5.11)
 * ====================================
 * O que o motorista pode aceitar depende do que ele dirige. Quem está de carro
 * recebe UberX e Uber Envios; quem está de moto recebe Uber Moto e Uber Flash.
 * Não é uma variação de rótulo: são catálogos diferentes, e oferecer UberX a
 * uma moto seria oferecer uma corrida que ela não pode cumprir.
 *
 * Por isso a lista é indexada pelo veículo ATIVO, e não uma lista só com um
 * campo "vale para moto". Uma lista única obrigaria toda tela que a consome a
 * lembrar de filtrar — e o dia em que uma esquecesse, a moto veria UberX.
 */
export const tiposServico = {
  carro: [
    { nome: 'Entregas', icone: 'shopping_bag', demanda: false },
    { nome: 'Viagens', icone: 'person', demanda: true },
    { nome: 'Uber Envios', icone: 'cube_outline', demanda: false },
    { nome: 'UberX', icone: 'person', demanda: true },
  ],
  moto: [
    { nome: 'Entregas', icone: 'shopping_bag', demanda: false },
    { nome: 'Uber Flash', icone: 'cube_outline', demanda: false },
    { nome: 'Flash+', icone: 'person', demanda: false },
    { nome: 'Uber Moto', icone: 'person', demanda: false },
  ],
};

const FILTRO_TROCAS = {
  chave: 'trocas',
  icone: 'swap_horiz',
  label: 'Trocas de viagens',
  sub: 'Nova viagem com outro usuário que está mais perto de você',
};
const FILTRO_DINHEIRO = {
  chave: 'dinheiro',
  icone: 'local_atm',
  label: 'Aceitar dinheiro',
  sub: '',
};
const FILTRO_AVALIACAO = {
  chave: 'avaliacao',
  icone: 'person_search',
  label: 'Avaliação do usuário',
  sub: 'Defina uma avaliação mínima de usuário para solicitações de viagem.',
};

/**
 * Filtros de viagem (toggles) da tela Preferências, também por veículo.
 *
 * "Trocas de viagens" só aparece na moto: é a realocação de uma corrida para
 * quem está mais perto, que faz sentido no trânsito de duas rodas e não na
 * operação de carro.
 */
export const filtrosViagem = {
  carro: [FILTRO_DINHEIRO, FILTRO_AVALIACAO],
  moto: [FILTRO_TROCAS, FILTRO_DINHEIRO, FILTRO_AVALIACAO],
};

/** Atributos do perfil público. */
export const atributosPerfil = [
  // No vídeo a frase do motorista aparece ENTRE ASPAS — é uma citação dele,
  // não um rótulo do app. A pontuação faz parte do conteúdo.
  { icone: 'waving_hand', texto: '"Simpático e educado"' },
  { icone: 'language', texto: 'Fala inglês e espanhol' },
  { icone: 'home', texto: 'De Belo Horizonte' },
  { icone: 'pie_chart', texto: '0 viagens em 0 anos' },
];

/** Bairros rotulados sobre o mapa (Fortaleza/CE). */
export const bairros = ['Benfica', 'Aldeota', 'Joaquim Távora', 'Dionísio Torres', 'Meireles'];
