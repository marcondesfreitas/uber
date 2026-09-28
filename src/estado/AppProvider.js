import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as haptica from './haptica';
import * as somCorrida from '../services/somCorrida';
import { gravar, ler } from './armazenamento';
import {
  SEGUNDOS_CONTAGEM,
  SEGUNDOS_ESPERA_GRATIS,
  emCorrida,
  transitar,
} from './maquinaCorrida';
import { corridaExemplo, motorista, veiculos } from '../data/mock';

/**
 * ESTADO GLOBAL DO APP
 * ====================
 *
 * POR QUE CONTEXT E NÃO REACT NAVIGATION
 * --------------------------------------
 * O ROADMAP prevê React Navigation no Módulo 2 e ele é a escolha certa para um
 * app que cresce. Aqui a navegação é uma única variável (`tela`) porque o
 * protótipo tem uma característica incomum: a tela do mapa NUNCA desmonta
 * durante a corrida. Ela guarda a câmera, o GPS e a simulação de demanda —
 * empilhar telas por cima dela e deixá-la ser destruída pelo navegador
 * significaria reiniciar o mapa a cada passo do fluxo.
 *
 * Quando você trocar por React Navigation, o padrão correto é: as telas de
 * GESTÃO viram um Stack de verdade, e o fluxo da corrida continua sendo esta
 * máquina de estados dentro de UMA tela. Navegação e máquina de estados
 * resolvem problemas diferentes; misturar as duas é o erro clássico aqui.
 *
 * POR QUE TODOS OS TIMERS MORAM NESTE ARQUIVO
 * -------------------------------------------
 * Contagem regressiva, cronômetro de espera e acúmulo do ganho são LÓGICA DE
 * NEGÓCIO, não animação de tela. Se cada componente criasse o seu, um
 * `setInterval` sobreviveria a uma tela desmontada e você teria o vazamento
 * mais difícil de achar: o app aceita uma corrida que o usuário já recusou.
 */

/** Chaves do que sobrevive entre sessões. Ver o comentário no provider. */
const CHAVE_PERFIL = 'perfil';

/**
 * O app já foi ativado neste aparelho?
 *
 * Guardar isso é o que cumpre a promessa escrita na própria tela de ativação:
 * "o app abrirá diretamente na próxima vez". Sem persistir, o aviso seria
 * mentira — e o usuário digitaria um token a cada abertura.
 */
const CHAVE_ATIVACAO = 'ativado';

/**
 * O TOKEN QUE LIBERA O APP NUM APARELHO NOVO
 * ==========================================
 * Comparado sem diferenciar maiúsculas e sem espaços nas pontas: o campo já
 * força versalete no celular, mas no teclado do computador não força, e
 * recusar "motorista7" seria recusar quem digitou certo.
 *
 * ⚠️ ISTO É UMA PORTEIRA, NÃO SEGURANÇA.
 * O token viaja no pacote JavaScript que o navegador baixa — quem abrir as
 * ferramentas de desenvolvedor acha em segundos, e a marca de "já ativado"
 * mora no armazenamento local, que qualquer um edita. Serve para controlar
 * quem entra numa demonstração; não serve para proteger nada.
 *
 * Proteção de verdade exige um servidor validando o token e devolvendo uma
 * credencial assinada — nada disso pode morar no aparelho.
 */
const TOKEN_ATIVACAO = 'MOTORISTA7';

/**
 * Qual veículo está ativo e como os dois estão configurados.
 *
 * Guarda os DOIS e não só o ativo: quem edita a placa da moto e depois troca
 * para o carro espera encontrar a moto como deixou ao voltar.
 */
const CHAVE_VEICULO = 'veiculo';

/**
 * A chave antiga, de quando só a foto era guardada.
 *
 * Fica aqui para quem já tinha uma foto salva não perdê-la ao atualizar o app.
 * É lida uma vez, transferida para o perfil novo e apagada. Pode sumir daqui
 * quando não houver mais ninguém rodando a versão antiga — mas custa quatro
 * linhas, e o sintoma que ela evita (a foto some sozinha depois de um deploy)
 * é do tipo que ninguém liga a uma mudança de formato.
 */
const CHAVE_FOTO_ANTIGA = 'perfil.foto';

const AppContext = createContext(null);

/**
 * Qual aba da tab bar acende para cada tela.
 *
 * Só as telas que TÊM tab bar aparecem aqui; as outras deixam a aba como
 * estava, que é o certo — abrir "Editar perfil" não deve apagar a aba Menu.
 *
 * Repare que a chave da aba de mensagens é `msg`, e não `mensagens`: a tab bar
 * foi escrita antes da tela e usa o nome curto. Este mapa é o único lugar onde
 * esse desencontro precisa ser conhecido.
 */
const ABA_DA_TELA = {
  inicio: 'inicio',
  descubra: 'descubra',
  mensagens: 'msg',
  ganhos: 'ganhos',
  menu: 'menu',
};

/** Hook de acesso. Falha alto se alguém esquecer o Provider — melhor um erro
 *  claro em desenvolvimento do que `undefined.tela` três telas adiante. */
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp precisa estar dentro de <AppProvider>');
  return ctx;
}

export function AppProvider({ children }) {
  // ── Navegação ────────────────────────────────────────────────────────────
  const [tela, setTela] = useState('splash');
  // Começa em false: se a leitura do disco demorar, a portaria aparece — que
  // é o erro seguro. O contrário deixaria entrar sem ativar.
  const [ativado, setAtivado] = useState(false);
  const [aba, setAba] = useState('inicio');
  const telaAnteriorRef = useRef('inicio'); // de onde vim para Preferências

  // ── Corrida ──────────────────────────────────────────────────────────────
  const [corrida, setCorrida] = useState('ociosa');
  const [contagem, setContagem] = useState(SEGUNDOS_CONTAGEM);
  const [espera, setEspera] = useState(0);
  const [ganho, setGanho] = useState(0);
  const [ganhoDia, setGanhoDia] = useState(0);
  const [nota, setNota] = useState(5);

  // ── Preferências e dados editáveis ───────────────────────────────────────
  const [camadaDemanda, setCamadaDemanda] = useState(true);
  const [veiculoAtivo, setVeiculoAtivo] = useState('carro');

  /**
   * A GARAGEM: OS DOIS VEÍCULOS, NÃO SÓ O ATIVO
   * ===========================================
   * Antes o provider guardava apenas o veículo em uso. Isso bastava para
   * exibir, mas perdia edições: mudar a placa da moto, trocar para o carro e
   * voltar trazia de novo os dados de fábrica — porque a tela de gerenciar
   * relia o mock a cada troca.
   *
   * Guardando os DOIS, cada um lembra do que foi editado, e o veículo em uso
   * vira uma derivação (`garagem[veiculoAtivo]`) em vez de um terceiro estado
   * a manter em acordo com os outros dois.
   */
  const [garagem, setGaragem] = useState(veiculos);
  const veiculo = garagem[veiculoAtivo];

  /**
   * Escreve no lugar certo da garagem a partir do `tipo` do próprio objeto.
   *
   * Mantém a assinatura que as telas já usavam — `setVeiculo(rascunho)` —
   * então nenhuma delas precisou mudar por causa da garagem.
   */
  const setVeiculo = useCallback((dados) => {
    if (!dados || !dados.tipo) return;
    setGaragem((g) => ({ ...g, [dados.tipo]: dados }));
  }, []);
  const [perfil, setPerfil] = useState({
    nome: motorista.nome,
    email: motorista.email,
    genero: motorista.genero,
    telefone: motorista.telefone,
    idioma: motorista.idioma,
    bio: motorista.bio,
    cidade: motorista.cidade,
    // `null` = sem foto, e o Avatar desenha o ícone. Guardamos só a URI: a
    // imagem em si fica no armazenamento do aparelho, e carregar bytes para
    // dentro do estado do React seria desperdício de memória a cada render.
    foto: null,
  });
  /**
   * O PERFIL SOBREVIVE AO FECHAMENTO DO APP
   * =======================================
   * Nome, foto, telefone, bio — tudo o que a tela "Editar perfil" muda. É o
   * único conjunto de dados que o usuário CRIA no protótipo; todo o resto é
   * ficção nossa. Perdê-lo a cada abertura fazia a edição parecer que não
   * tinha funcionado.
   *
   * Guardamos o OBJETO INTEIRO, não campo a campo. Uma chave por campo daria
   * sete leituras e sete gravações, e obrigaria a lembrar de registrar cada
   * campo novo — exatamente o tipo de coisa que se esquece.
   *
   * Fica aqui, e não na tela de editar, porque persistência é característica
   * do DADO, não de quem o edita. Amanhã outra tela pode mexer no perfil, e
   * ele continua sendo salvo sem ninguém pensar nisso.
   *
   * O QUE ESTÁ GUARDADO É MESCLADO SOBRE O PADRÃO
   * ---------------------------------------------
   * `{ ...p, ...salvo }` e não `salvo` puro: assim, um campo acrescentado
   * depois nasce com o valor padrão em vez de `undefined` para quem já tinha
   * um perfil salvo da versão anterior.
   *
   * A ORDEM IMPORTA, E ELA TEM UMA ARMADILHA
   * ----------------------------------------
   * São dois efeitos: um lê o valor guardado ao abrir, o outro grava quando o
   * perfil muda. O de gravar também roda na montagem — e nesse instante o
   * perfil ainda é o padrão, porque a leitura é assíncrona e não voltou.
   *
   * Sem proteção, abrir o app SOBRESCREVERIA o perfil salvo com os valores de
   * fábrica antes de conseguir carregá-lo. O `jaLeu` segura a primeira
   * gravação até a leitura terminar.
   */
  const jaLeu = useRef(false);

  useEffect(() => {
    let vivo = true;

    (async () => {
      const bruto = await ler(CHAVE_PERFIL);
      const fotoAntiga = await ler(CHAVE_FOTO_ANTIGA);
      const jaAtivado = await ler(CHAVE_ATIVACAO);
      const brutoVeiculo = await ler(CHAVE_VEICULO);
      if (!vivo) return;

      if (jaAtivado) setAtivado(true);

      try {
        const v = brutoVeiculo ? JSON.parse(brutoVeiculo) : null;
        // Mesclado sobre o padrão, como o perfil: um veículo acrescentado no
        // futuro nasce com os dados de fábrica em vez de `undefined`.
        if (v && v.garagem) setGaragem((g) => ({ ...g, ...v.garagem }));
        if (v && v.ativo) setVeiculoAtivo(v.ativo);
      } catch (e) {
        // JSON corrompido: segue com a garagem de fábrica.
      }

      let salvo = null;
      try {
        salvo = bruto ? JSON.parse(bruto) : null;
      } catch (e) {
        // JSON corrompido: começa do padrão em vez de derrubar o app. O
        // próximo "Salvar" sobrescreve o valor quebrado.
        salvo = null;
      }

      if (salvo) setPerfil((p) => ({ ...p, ...salvo }));
      else if (fotoAntiga) setPerfil((p) => ({ ...p, foto: fotoAntiga }));

      if (fotoAntiga) gravar(CHAVE_FOTO_ANTIGA, null);
      jaLeu.current = true;
    })();

    return () => {
      vivo = false;
    };
  }, []);

  useEffect(() => {
    if (!jaLeu.current) return;
    gravar(CHAVE_PERFIL, JSON.stringify(perfil));
  }, [perfil]);

  // Mesma trava do perfil: sem ela, a gravação da montagem sobrescreveria o
  // veículo salvo com o de fábrica antes de a leitura voltar.
  useEffect(() => {
    if (!jaLeu.current) return;
    gravar(CHAVE_VEICULO, JSON.stringify({ ativo: veiculoAtivo, garagem }));
  }, [veiculoAtivo, garagem]);


  /**
   * O que o motorista aceita, SEPARADO POR VEÍCULO.
   *
   * Poderia ser um objeto plano com todos os nomes juntos, já que eles não se
   * repetem entre carro e moto — exceto "Entregas", que existe nos dois. E é
   * justamente esse caso que decide: com um objeto plano, ligar Entregas no
   * carro ligaria Entregas na moto também. São decisões distintas (entregar de
   * carro e de moto são operações diferentes), então merecem estados
   * distintos.
   *
   * Os nomes batem com `tiposServico` em data/mock.js. Os marcados de início
   * são os que aparecem marcados nas telas de referência.
   */
  const [tiposAceitos, setTiposAceitos] = useState({
    carro: { Entregas: false, Viagens: true, 'Uber Envios': false, UberX: true },
    moto: { Entregas: false, 'Uber Flash': false, 'Flash+': false, 'Uber Moto': true },
  });
  // Nas referências todos os filtros aparecem desligados. Estes ficam PLANOS,
  // ao contrário dos tipos de serviço: "aceitar dinheiro" quer dizer a mesma
  // coisa nos dois veículos, e obrigar o motorista a repetir a escolha ao
  // trocar de veículo seria burocracia, não fidelidade.
  const [filtros, setFiltros] = useState({ trocas: false, dinheiro: false, avaliacao: false });
  const [tabConta, setTabConta] = useState('Página inicial');
  const [semanaComDados, setSemanaComDados] = useState(false);

  // ── Toast ────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState(null);
  const timerToast = useRef(null);

  const mostrarToast = useCallback((mensagem) => {
    clearTimeout(timerToast.current);
    setToast(mensagem);
    timerToast.current = setTimeout(() => setToast(null), 2400);
  }, []);

  // Limpeza do timer do toast quando o app inteiro sai de cena.
  useEffect(() => () => clearTimeout(timerToast.current), []);

  /**
   * ── Splash ───────────────────────────────────────────────────────────────
   * Quem controla a DURAÇÃO é a própria SplashScreen, não este arquivo.
   *
   * A duração (2,3 s) pertence à sequência visual: mexer nela é mexer na
   * animação. Se o tempo morasse aqui, mudar a animação exigiria editar dois
   * arquivos e mantê-los em acordo — e um dia eles discordariam, cortando a
   * splash no meio.
   *
   * A tela avisa que terminou; o provider só decide para onde ir. E para onde
   * ir depende da ATIVAÇÃO: quem já ativou neste aparelho cai direto na
   * Início, quem não ativou passa pela portaria.
   */
  const concluirSplash = useCallback(() => {
    setTela((atual) => (atual === 'splash' ? (ativado ? 'inicio' : 'ativacao') : atual));
  }, [ativado]);

  /**
   * Confere o token e, se bater, libera o app neste aparelho para sempre.
   *
   * Devolve `true`/`false` em vez de mostrar o erro daqui: quem sabe COMO
   * avisar é a tela — com a borda vermelha, a mensagem embaixo do campo e o
   * foco de volta no input. O provider decide SE pode entrar; a tela decide
   * como contar o resultado.
   */
  const ativar = useCallback((token) => {
    const digitado = String(token || '').trim().toUpperCase();
    if (digitado !== TOKEN_ATIVACAO) return false;

    setAtivado(true);
    gravar(CHAVE_ATIVACAO, '1');
    setTela('inicio');
    return true;
  }, []);

  // ── Navegação ────────────────────────────────────────────────────────────
  const navegar = useCallback((destino) => {
    if (!destino) return;
    setTela((atual) => {
      telaAnteriorRef.current = atual;
      return destino;
    });
    // As telas com tab bar precisam manter a aba coerente com o destino,
    // senão o usuário abre "Ganhos" pelo mapa e a tab bar continua em "Início".
    // Vale para quem chega por FORA da tab bar também: o Menu tem uma linha
    // "Descubra", e chegar por ali sem acender a aba deixaria a barra mentindo.
    const abaDoDestino = ABA_DA_TELA[destino];
    if (abaDoDestino) setAba(abaDoDestino);
  }, []);

  const voltarDePreferencias = useCallback(() => {
    setTela(telaAnteriorRef.current || 'inicio');
  }, []);

  // ── Transições da corrida ────────────────────────────────────────────────
  /**
   * TODO evento da corrida passa por aqui. Um único ponto de entrada é o que
   * torna a máquina confiável: não existe outro caminho para mudar `corrida`.
   */
  const evento = useCallback((nome) => {
    setCorrida((atual) => {
      const proximo = transitar(atual, nome);
      if (proximo === atual) return atual; // transição inválida: ignorada

      // Efeitos colaterais de ENTRADA em cada estado.
      if (proximo === 'recebida') {
        setContagem(SEGUNDOS_CONTAGEM);
        haptica.avisarSolicitacao();
      }
      if (proximo === 'aguardando') setEspera(0);
      if (proximo === 'em_viagem') setGanho(0);
      if (proximo === 'finalizada') {
        setGanhoDia((v) => v + corridaExemplo.valor);
        setNota(5);
        setTela('resumo');
      }
      return proximo;
    });
  }, []);

  // ── Timer 1: a próxima viagem chega sozinha ──────────────────────────────
  // Só roda com o motorista ONLINE, no mapa e ocioso. É o que faz o protótipo
  // ter um fluxo de verdade em vez de depender de um botão de demonstração.
  //
  // Se ele recusar, o efeito roda de novo (porque `corrida` voltou a 'ociosa')
  // e outra oferta chega — que é exatamente o comportamento real. O `return`
  // do useEffect cancela o timer se ele sair da tela no meio da espera.
  useEffect(() => {
    if (tela !== 'mapa' || corrida !== 'ociosa') return undefined;
    const id = setTimeout(() => evento('RECEBER'), 6000);
    return () => clearTimeout(id);
  }, [tela, corrida, evento]);

  /**
   * ── O ALERTA SONORO ──────────────────────────────────────────────────────
   * Toca em loop enquanto a oferta está na tela, e para quando ela sai.
   *
   * Repare que NÃO existe um `pararSom()` espalhado por `aceitar`, `recusar`
   * e `EXPIRAR`. O som está amarrado ao ESTADO, não aos eventos: enquanto
   * `corrida === 'recebida'`, ele toca; em qualquer outro estado, não.
   *
   * A limpeza do useEffect roda em toda saída do estado — inclusive nas que
   * eu esquecesse de prever, ou numa que você acrescente amanhã. É a diferença
   * entre "lembrei de parar em três lugares" e "é impossível não parar".
   */
  useEffect(() => {
    if (corrida !== 'recebida') return undefined;
    somCorrida.tocarSolicitacao();
    return () => {
      somCorrida.pararSolicitacao();
    };
  }, [corrida]);

  // Se o app inteiro sair de cena com uma oferta na tela, o som não pode
  // continuar tocando por cima de outro aplicativo.
  useEffect(() => () => {
    somCorrida.pararSolicitacao();
  }, []);

  // ── Timer 2: contagem regressiva da solicitação ──────────────────────────
  // Roda a 10 Hz para a barra descer suave. O evento EXPIRAR entra pela mesma
  // porta que o toque do usuário — a máquina resolve quem chegou primeiro.
  useEffect(() => {
    if (corrida !== 'recebida') return undefined;
    const id = setInterval(() => {
      setContagem((c) => {
        if (c <= 0.1) {
          evento('EXPIRAR');
          haptica.alertar();
          mostrarToast('Tempo esgotado — viagem recusada');
          return 0;
        }
        return c - 0.1;
      });
    }, 100);
    return () => clearInterval(id);
  }, [corrida, evento, mostrarToast]);

  // ── Timer 3: cronômetro de espera do passageiro ──────────────────────────
  useEffect(() => {
    if (corrida !== 'aguardando') return undefined;
    const id = setInterval(() => setEspera((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [corrida]);

  // ── Timer 4: ganho parcial subindo durante a viagem ──────────────────────
  // Puramente cosmético — no app real o valor vem do servidor ao finalizar.
  // Está aqui porque ver o número subir é o que faz a tela parecer viva.
  useEffect(() => {
    if (corrida !== 'em_viagem') return undefined;
    const id = setInterval(() => {
      setGanho((v) => Math.min(corridaExemplo.valor, v + 0.42));
    }, 350);
    return () => clearInterval(id);
  }, [corrida]);

  // ── Ações de alto nível (o que os botões chamam) ─────────────────────────
  const timerOnline = useRef(null);

  /**
   * Ficar online tem TRÊS passos, não um:
   *
   *   verificação facial → ficando online → mapa
   *
   * O primeiro é uma porta: sem confirmar quem está dirigindo, não se recebe
   * corrida. O segundo é espera honesta (GPS e mapa levam segundos mesmo).
   * Separar os dois importa porque eles falham por motivos diferentes — e um
   * dia a verificação vai bater num servidor, enquanto a outra nunca vai.
   */
  const ficarOnline = useCallback(() => {
    // No navegador do celular, o áudio só é liberado por um toque de verdade —
    // e a oferta chega por temporizador, sem toque nenhum. Este é o último
    // gesto obrigatório antes de receber corrida, então é aqui que o alerta
    // sonoro ganha permissão para tocar depois. Sem `await` antes: o navegador
    // só aceita enquanto o gesto ainda está valendo. No aparelho é um no-op.
    somCorrida.destravarAudio();
    setTela('verificacaoFacial');
  }, []);

  const verificacaoAprovada = useCallback(() => {
    setTela('ficandoOnline');
    // A tela "Ficando online…" é honesta: o app REALMENTE precisa de alguns
    // segundos para pegar GPS e carregar o mapa. Fingir instantaneidade e
    // depois travar é pior que mostrar o que está acontecendo.
    clearTimeout(timerOnline.current);
    timerOnline.current = setTimeout(() => setTela('mapa'), 2000);
  }, []);

  useEffect(() => () => clearTimeout(timerOnline.current), []);

  const ficarOffline = useCallback(() => {
    clearTimeout(timerOnline.current);
    setCorrida('ociosa');
    setTela('inicio');
    setAba('inicio');
    mostrarToast('Você está offline');
  }, [mostrarToast]);

  const simularSolicitacao = useCallback(() => {
    setTela('mapa');
    evento('RECEBER');
  }, [evento]);

  const aceitar = useCallback(() => {
    evento('ACEITAR');
    haptica.confirmar();
    mostrarToast('Viagem aceita — siga para a retirada');
  }, [evento, mostrarToast]);

  const recusar = useCallback(() => {
    evento('RECUSAR');
    mostrarToast('Viagem recusada');
  }, [evento, mostrarToast]);

  const cancelar = useCallback(() => {
    evento('CANCELAR');
    mostrarToast('Viagem cancelada');
  }, [evento, mostrarToast]);

  const cheguei = useCallback(() => {
    evento('CHEGUEI');
    haptica.confirmar();
  }, [evento]);

  const iniciar = useCallback(() => {
    evento('INICIAR');
    haptica.confirmar();
  }, [evento]);

  const finalizar = useCallback(() => {
    evento('FINALIZAR');
    haptica.confirmar();
  }, [evento]);

  const voltarAoMapa = useCallback(() => {
    evento('REINICIAR');
    setTela('mapa');
  }, [evento]);

  // ── Valor do contexto ────────────────────────────────────────────────────
  // `useMemo` aqui não é otimização prematura: sem ele, o objeto do contexto
  // é novo a cada render do Provider e TODO componente que consome o contexto
  // re-renderiza — inclusive o mapa, 10 vezes por segundo durante a contagem.
  const valor = useMemo(
    () => ({
      // navegação
      tela,
      ativado,
      ativar,
      aba,
      navegar,
      concluirSplash,
      setAba,
      voltarDePreferencias,
      // corrida
      corrida,
      contagem,
      espera,
      ganho,
      ganhoDia,
      nota,
      setNota,
      dirigindo: emCorrida(corrida),
      segundosContagem: SEGUNDOS_CONTAGEM,
      segundosEsperaGratis: SEGUNDOS_ESPERA_GRATIS,
      ficarOnline,
      verificacaoAprovada,
      ficarOffline,
      simularSolicitacao,
      aceitar,
      recusar,
      cancelar,
      cheguei,
      iniciar,
      finalizar,
      voltarAoMapa,
      // preferências e dados
      camadaDemanda,
      setCamadaDemanda,
      veiculoAtivo,
      setVeiculoAtivo,
      veiculo,
      setVeiculo,
      garagem,
      perfil,
      setPerfil,
      tiposAceitos,
      setTiposAceitos,
      filtros,
      setFiltros,
      tabConta,
      setTabConta,
      semanaComDados,
      setSemanaComDados,
      // toast
      toast,
      mostrarToast,
    }),
    [
      tela, aba, navegar, concluirSplash, voltarDePreferencias,
      corrida, contagem, espera, ganho, ganhoDia, nota,
      ficarOnline, verificacaoAprovada, ficarOffline, simularSolicitacao,
      aceitar, recusar, cancelar, cheguei, iniciar, finalizar, voltarAoMapa,
      camadaDemanda, veiculoAtivo, veiculo, perfil, tiposAceitos, filtros,
      tabConta, semanaComDados, toast, mostrarToast,
    ]
  );

  return <AppContext.Provider value={valor}>{children}</AppContext.Provider>;
}
