import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import BarraOnline from '../components/corrida/BarraOnline';
import SheetAguardando from '../components/corrida/SheetAguardando';
import SheetEmViagem from '../components/corrida/SheetEmViagem';
import SheetIndoBuscar from '../components/corrida/SheetIndoBuscar';
import SheetSolicitacao from '../components/corrida/SheetSolicitacao';
import AvisoTecnico from '../components/AvisoTecnico';
import PainelZona from '../components/PainelZona';
import SuperficieMapa from '../components/SuperficieMapa';
import Icone from '../components/ui/Icone';
import Tela, { TOPO_SEGURO } from '../components/ui/Tela';
import { useApp } from '../estado/AppProvider';
import {
  CENTRO_FORTALEZA,
  PONTO_DESTINO,
  PONTO_RETIRADA,
  ROTA_ATE_DESTINO,
  ROTA_ATE_RETIRADA,
  ROTA_DA_OFERTA,
} from '../data/locais';
import { useZonasDemanda } from '../hooks/useZonasDemanda';
import { cores, espaco, raio } from '../theme/cores';
import { brl, familia, multiplicador, tipo } from '../theme/tipografia';

/**
 * MAPA / ONLINE — a tela mais importante do app (§5.12)
 * ====================================================
 *
 * Ela concentra tudo o que os Módulos 1 e 1.5 construíram (GPS, simulação de
 * demanda, surge) e recebe o fluxo da corrida do Módulo 2 por cima, em camadas.
 *
 * A ARQUITETURA EM CAMADAS, DE BAIXO PARA CIMA:
 *
 *   1. SuperficieMapa     o mundo + demanda + rota, sempre montada
 *   2. Controles          botões flutuantes (topo e lateral direita)
 *   3. Faixa / PainelZona informação sobre demanda
 *   4. Sheet da corrida   a superfície CLARA que muda por estado
 *
 * O MAPA É UMA PEÇA TROCÁVEL
 * --------------------------
 * Esta tela NÃO importa `react-native-maps`. Ela pede um `<SuperficieMapa>` e
 * descreve o que quer ver; quem decide como desenhar é o arquivo escolhido
 * pela plataforma (`SuperficieMapa.js` no celular, `SuperficieMapa.web.js` no
 * navegador). Isso mantém o app inteiro empacotável para a web, onde o
 * `react-native-maps` não existe — e, de quebra, deixa a tela testável sem
 * subir um mapa nativo.
 *
 * POR QUE O MAPA NUNCA DESMONTA
 * -----------------------------
 * Um mapa nativo é uma view cara: montar custa memória e alguns frames em
 * branco. Se cada estado da corrida fosse uma tela empilhada por um navegador,
 * o mapa reiniciaria a cada passo — perdendo zoom, rotação e o ponto onde o
 * motorista estava olhando. Por isso o fluxo inteiro acontece DENTRO desta
 * tela, trocando só o sheet de baixo. É a razão de a navegação do app ser uma
 * máquina de estados (veja `src/estado/maquinaCorrida.js`).
 */
export default function MapaScreen() {
  const {
    corrida,
    contagem,
    segundosContagem,
    espera,
    segundosEsperaGratis,
    ganho,
    ganhoDia,
    dirigindo,
    camadaDemanda,
    setCamadaDemanda,
    navegar,
    ficarOffline,
    aceitar,
    recusar,
    cancelar,
    cheguei,
    iniciar,
    finalizar,
    mostrarToast,
  } = useApp();

  const [seguindo, setSeguindo] = useState(true);
  const [zonaSelecionada, setZonaSelecionada] = useState(null);

  /**
   * O MOTORISTA FICA EM FORTALEZA, SEM CONSULTAR O GPS
   * ==================================================
   * O protótipo inteiro acontece em Fortaleza: a grade de demanda, os
   * endereços da corrida, o aeroporto do destino. Com o GPS real ligado, o
   * puck aparecia na cidade de quem está testando enquanto a oferta era uma
   * corrida para o Pinto Martins — dois lugares na mesma tela, e a simulação
   * deixava de fazer sentido.
   *
   * A posição é a MESMA de onde a rota começa (`CENTRO_FORTALEZA`), então o
   * traçado da corrida sai de debaixo do puck em vez de nascer solto no mapa.
   *
   * `heading: 0` porque não há movimento real para medir. O puck aponta para o
   * norte e fica quieto — mentir um giro seria pior do que não girar.
   *
   * O GPS de verdade continua implementado em `src/hooks/useLocalizacaoMotorista.js`,
   * fora de uso. Para religá-lo, troque esta constante pela chamada do hook.
   */
  const local = { ...CENTRO_FORTALEZA, heading: 0, speed: 0 };
  const centroGrade = CENTRO_FORTALEZA;

  const { zonas, melhorZona } = useZonasDemanda({
    centro: centroGrade,
    ativo: camadaDemanda,
    intervaloMs: 4000,
  });

  // O painel aberto precisa acompanhar o tick de 4 s do simulador, senão
  // mostra números congelados no instante do toque enquanto o mapa por trás
  // já mudou de cor. Card e mapa discordando é pior que card desatualizado.
  useEffect(() => {
    if (!zonaSelecionada) return;
    const atualizada = zonas.find((z) => z.id === zonaSelecionada.id);
    if (atualizada) setZonaSelecionada(atualizada);
  }, [zonas]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fecha o painel de zona ao entrar numa corrida: com destino definido, a
  // demanda das redondezas vira ruído.
  useEffect(() => {
    if (dirigindo) setZonaSelecionada(null);
  }, [dirigindo]);

  /**
   * O QUE O MAPA DESENHA EM CADA ESTADO DA CORRIDA
   * ----------------------------------------------
   * Rota e paradas saem do MESMO `useMemo` porque são a mesma decisão: a
   * linha sem os pinos não diz onde ela começa e termina, e os pinos sem a
   * linha não dizem como se chega de um ao outro. Separá-los em dois lugares
   * é como os dois discordariam um dia.
   *
   *   recebida     → viagem inteira, com retirada E destino. É a informação
   *                  que decide o "aceito ou não" nos 12 segundos da oferta.
   *   indo_buscar  → só até o passageiro; o destino ainda não interessa.
   *   em_viagem    → só até o destino; a retirada já ficou para trás.
   */
  const { rota, paradas } = useMemo(() => {
    if (corrida === 'recebida') {
      return {
        rota: ROTA_DA_OFERTA,
        paradas: [
          { ponto: PONTO_RETIRADA, tipo: 'retirada' },
          { ponto: PONTO_DESTINO, tipo: 'destino' },
        ],
      };
    }
    if (corrida === 'indo_buscar' || corrida === 'aguardando') {
      return { rota: ROTA_ATE_RETIRADA, paradas: [{ ponto: PONTO_RETIRADA, tipo: 'retirada' }] };
    }
    if (corrida === 'em_viagem') {
      return { rota: ROTA_ATE_DESTINO, paradas: [{ ponto: PONTO_DESTINO, tipo: 'destino' }] };
    }
    return { rota: null, paradas: [] };
  }, [corrida]);

  // Ao entrar numa corrida a superfície enquadra a rota, então parar de seguir
  // o motorista evita que as duas câmeras briguem pelo enquadramento.
  useEffect(() => {
    if (rota) setSeguindo(false);
  }, [rota]);

  /**
   * POR QUE `seguindo` NÃO PODE VIR SÓ DO ESTADO
   * --------------------------------------------
   * O efeito acima desliga o acompanhamento quando aparece uma rota, mas ele
   * roda DEPOIS da renderização — e nesse meio-tempo a superfície já recebeu
   * `seguindo = true` junto com a rota nova. Resultado: ela enquadra a rota e,
   * no mesmo quadro, a câmera de acompanhamento recentraliza no motorista,
   * jogando o trajeto para fora da tela.
   *
   * Isso só aparecia na PRIMEIRA corrida: a partir da segunda o estado já
   * estava desligado da vez anterior, e o enquadramento sobrevivia.
   *
   * Derivar o valor resolve na origem: enquanto existir rota, a superfície
   * NUNCA vê `seguindo` ligado, nem por um quadro.
   */
  const seguindoMotorista = seguindo && !rota;

  const faixaVisivel =
    corrida === 'ociosa' && camadaDemanda && melhorZona && melhorZona.nivel >= 2 && !zonaSelecionada;

  return (
    <Tela>
      {/* ── Camada 1: o mundo ────────────────────────────────────────────── */}
      <SuperficieMapa
        local={local}
        zonas={zonas}
        // Durante a corrida a camada de demanda sai de cena: o motorista já
        // tem um destino, e cores competindo com a rota atrapalham a leitura.
        mostrarDemanda={camadaDemanda && !dirigindo}
        onSelecionarZona={setZonaSelecionada}
        rota={rota}
        paradas={paradas}
        seguindo={seguindoMotorista}
        dirigindo={dirigindo}
        onArrastar={() => setSeguindo(false)}
        onTocarFundo={() => setZonaSelecionada(null)}
      />

      {/* ── Camada 2: controles flutuantes ───────────────────────────────── */}
      <View style={estilos.topo} pointerEvents="box-none">
        <BotaoMapa icone="home" rotulo="Ficar offline" onPress={ficarOffline} />

        <View style={estilos.pilulaGanho} accessibilityLabel={`Ganho do dia: ${brl(ganhoDia)}`}>
          <Icone nome="attach_money" tamanho={18} cor={cores.online} />
          <Text style={estilos.ganhoTexto}>{brl(ganhoDia)}</Text>
        </View>

        <BotaoMapa
          icone="search"
          rotulo="Buscar no mapa"
          onPress={() => mostrarToast('Busca no mapa: em breve')}
        />
      </View>

      {/* A coluna lateral fica no ar o tempo todo — inclusive em viagem.
          Recentralizar o mapa e acionar a segurança são justamente as coisas
          que o motorista precisa DURANTE a corrida. Só o botão da camada de
          demanda some, porque a camada em si está desligada nesse momento. */}
      <View style={estilos.lateral} pointerEvents="box-none">
        {!dirigindo ? (
          <BotaoMapa
            icone="local_fire_department"
            rotulo={camadaDemanda ? 'Desligar camada de demanda' : 'Ligar camada de demanda'}
            ativo={camadaDemanda}
            onPress={() => {
              setZonaSelecionada(null);
              setCamadaDemanda((v) => !v);
              mostrarToast(camadaDemanda ? 'Camada de demanda desligada' : 'Camada de demanda ligada');
            }}
          />
        ) : null}

        <BotaoMapa icone="bar_chart" rotulo="Ver ganhos" onPress={() => navegar('ganhos')} />
        <BotaoMapa
          icone="explore"
          rotulo={seguindo ? 'Você está sendo seguido no mapa' : 'Centralizar no seu carro'}
          ativo={seguindo}
          onPress={() => setSeguindo(true)}
        />
      </View>

      {/* O escudo de segurança fica SOZINHO no canto inferior esquerdo, longe
          de todos os outros controles. É proposital: numa emergência, o alvo
          não pode estar encostado em nada que você possa acertar por engano. */}
      <View style={estilos.escudo} pointerEvents="box-none">
        <BotaoMapa
          icone="shield"
          corIcone={cores.acao}
          rotulo="Central de segurança"
          onPress={() => mostrarToast('Central de segurança: em breve')}
        />
      </View>

      {/* ── Camada 3: informação de demanda ──────────────────────────────── */}
      {faixaVisivel ? (
        <Pressable
          onPress={() => setZonaSelecionada(melhorZona)}
          accessibilityRole="button"
          accessibilityLabel={`Zona a ${multiplicador(melhorZona.multiplicador)} por perto. Toque para ver.`}
          style={({ pressed }) => [estilos.faixa, pressed && { opacity: 0.85 }]}
        >
          <Icone nome="trending_up" tamanho={18} cor="#FFFFFF" />
          <Text style={estilos.faixaTexto}>
            Zona a {multiplicador(melhorZona.multiplicador)} por perto
          </Text>
        </Pressable>
      ) : null}

      {/* A faixa "Obtendo sua localização…" saiu junto com o GPS: a posição do
          motorista é fixa, então não há espera nenhuma para anunciar. */}

      {!dirigindo ? (
        <View style={estilos.selo} pointerEvents="box-none">
          <AvisoTecnico contexto={{ demandaVisivel: camadaDemanda, camera: false }} />
        </View>
      ) : null}

      {zonaSelecionada && !dirigindo ? (
        <View style={estilos.painelZona} pointerEvents="box-none">
          <PainelZona zona={zonaSelecionada} onFechar={() => setZonaSelecionada(null)} />
        </View>
      ) : null}

      {/* ── Camada 4: o sheet do estado atual da corrida ─────────────────── */}
      {corrida === 'ociosa' ? (
        <BarraOnline
          onPreferencias={() => navegar('preferencias')}
          onMenu={() => navegar('menu')}
        />
      ) : null}

      {corrida === 'recebida' ? (
        <SheetSolicitacao
          contagem={contagem}
          total={segundosContagem}
          onAceitar={aceitar}
          onRecusar={recusar}
        />
      ) : null}

      {corrida === 'indo_buscar' ? (
        <SheetIndoBuscar onCheguei={cheguei} onCancelar={cancelar} onAcao={mostrarToast} />
      ) : null}

      {corrida === 'aguardando' ? (
        <SheetAguardando
          espera={espera}
          esperaGratis={segundosEsperaGratis}
          onIniciar={iniciar}
        />
      ) : null}

      {corrida === 'em_viagem' ? <SheetEmViagem ganho={ganho} onFinalizar={finalizar} /> : null}
    </Tela>
  );
}

function BotaoMapa({ icone, rotulo, onPress, ativo = false, corIcone = cores.texto }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      accessibilityState={{ selected: ativo }}
      hitSlop={4}
      style={({ pressed }) => [
        estilos.botaoMapa,
        ativo && estilos.botaoAtivo,
        pressed && { opacity: 0.75 },
      ]}
    >
      <Icone nome={icone} tamanho={22} cor={ativo ? '#F2913D' : corIcone} />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  topo: {
    position: 'absolute', top: TOPO_SEGURO + 8, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: espaco.md, zIndex: 12,
  },
  pilulaGanho: {
    height: 40, paddingHorizontal: espaco.md, borderRadius: 20,
    backgroundColor: cores.vidroEscuro,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 14, shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  ganhoTexto: { ...tipo.h3, color: cores.texto, fontVariant: ['tabular-nums'] },

  lateral: {
    position: 'absolute', top: TOPO_SEGURO + 70, right: espaco.md,
    gap: 10, zIndex: 12,
  },
  botaoMapa: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: cores.vidroEscuro,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 14, shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  // Camada de demanda LIGADA: o fundo some e sobra a chama laranja solta sobre
  // o mapa. O botão vira o próprio ícone — é o estado "ativo" mais econômico
  // que existe, e o que o app real usa.
  botaoAtivo: { backgroundColor: 'transparent', shadowOpacity: 0, elevation: 0 },

  faixa: {
    position: 'absolute', top: TOPO_SEGURO + 126, left: espaco.md, right: 74,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12,
    backgroundColor: 'rgba(217,72,75,0.92)', zIndex: 12,
    shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 20, shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  faixaTexto: { ...tipo.legenda, fontFamily: familia.semi, color: '#FFFFFF' },

  escudo: { position: 'absolute', left: espaco.md, bottom: 150, zIndex: 12 },
  selo: { position: 'absolute', left: espaco.md, bottom: 108, zIndex: 12, alignItems: 'flex-start' },

  painelZona: { position: 'absolute', left: 12, right: 12, bottom: 108, zIndex: 16 },
});
