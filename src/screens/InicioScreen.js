import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MiniMapaCalor from '../components/MiniMapaCalor';
import Icone from '../components/ui/Icone';
import Pressionavel from '../components/ui/Pressionavel';
import Tela, { TOPO_SEGURO } from '../components/ui/Tela';
import { useApp } from '../estado/AppProvider';
import { CENTRO_FORTALEZA } from '../data/locais';
import { motorista } from '../data/mock';
import { useZonasDemanda } from '../hooks/useZonasDemanda';
import { cores, espaco, raio, tempo } from '../theme/cores';
import { familia, tipo } from '../theme/tipografia';
import { DRIVER_NATIVO } from '../theme/animacao';

/**
 * Tendência de ganhos ao longo do dia — altura relativa de cada barra.
 *
 * São barras VERTICAIS, não horizontais: o eixo do tempo é horizontal na
 * cabeça de todo mundo (manhã à esquerda, noite à direita). Deitar o gráfico
 * obrigaria a pessoa a girar mentalmente o dia inteiro para lê-lo.
 *
 * A barra clara é "agora". Um único destaque num gráfico de 14 barras é o que
 * transforma dado em resposta: não é "veja a distribuição", é "você está aqui,
 * e aqui é bom".
 */
const TENDENCIA = [22, 30, 26, 44, 38, 52, 46, 68, 100, 74, 58, 64, 40, 28];
const INDICE_AGORA = 8;

/**
 * INÍCIO — a tela âncora (§5.2)
 * -----------------------------
 * É onde o motorista está quando NÃO está dirigindo, e ela tem uma só função:
 * convencê-lo a ficar online. Por isso a hierarquia é
 *
 *   promessa ("ganhos altos hoje") → prova (mapa de calor + gráfico) → ação
 *
 * e o CTA azul fica FIXO acima da tab bar, fora do scroll. Botão principal que
 * rola para fora da tela é a forma mais silenciosa de perder uma conversão.
 *
 * O MAPA AQUI É O MESMO DA TELA DE DIREÇÃO
 * ----------------------------------------
 * Mesmas ruas, mesmas manchas de calor, mesmo puck — só menor e sem gestos.
 * Isso importa porque a Início faz uma PROMESSA ("a demanda está alta") que a
 * tela de online precisa cumprir. Se as duas desenhassem a cidade de formas
 * diferentes, o motorista não teria como ligar uma coisa à outra.
 *
 * A prévia mostra Fortaleza SEMPRE, sem consultar o GPS. A pergunta desta tela
 * é "vale a pena sair?", que é sobre a cidade — não sobre a sua esquina. Ver o
 * comentário no corpo do componente.
 */
export default function InicioScreen() {
  const { navegar, ficarOnline, mostrarToast } = useApp();

  /**
   * ESTA TELA NÃO PEDE GPS — E É DE PROPÓSITO
   * -----------------------------------------
   * A prévia mostra SEMPRE Fortaleza, porque é lá que o protótipo inteiro
   * acontece: a demanda simulada, os endereços da corrida, o aeroporto do
   * destino. Centrar no GPS real punha o motorista na cidade dele com zonas
   * de calor de Fortaleza por cima — dois lugares na mesma imagem.
   *
   * E é a PRIMEIRA tela do app. Pedir permissão de localização antes de o
   * usuário fazer qualquer coisa é o prompt que mais gente nega, justamente
   * por chegar sem contexto. Aqui não há nada que dependa dela: o mapa é uma
   * ilustração do mercado, não a posição de ninguém.
   *
   * O GPS continua existindo, e é pedido em `MapaScreen` — quando o motorista
   * fica online, que é o momento em que a pergunta se explica sozinha.
   */
  const { zonas } = useZonasDemanda({
    centro: CENTRO_FORTALEZA,
    ativo: true,
    intervaloMs: 4000,
  });

  return (
    <Tela>
      <ScrollView
        contentContainerStyle={estilos.conteudo}
        showsVerticalScrollIndicator={false}
      >
        <View style={estilos.acoesTopo}>
          <BotaoRedondo
            icone="shield"
            cor={cores.acao}
            rotulo="Segurança"
            onPress={() => mostrarToast('Central de segurança: em breve')}
          />
          <BotaoRedondo icone="tune" rotulo="Preferências" onPress={() => navegar('preferencias')} />
        </View>

        <View style={estilos.cabecalho}>
          <Text style={estilos.titulo}>
            {motorista.cidadeOperacao}:{'\n'}ganhos altos hoje
          </Text>
          <Text style={estilos.subtitulo}>
            Agora será um bom momento para dirigir, a demanda está alta no momento.
          </Text>
        </View>

        <View style={estilos.mapa}>
          <MiniMapaCalor
            zonas={zonas}
            // Sem GPS aqui: o puck cai no centro padrão, que é Fortaleza.
            local={null}
            onExpandir={ficarOnline}
            onBuscar={() => mostrarToast('Busca no mapa: em breve')}
          />
        </View>

        <View style={estilos.linhaSecao}>
          <Text style={estilos.secao}>Oportunidades</Text>
          <BotaoRedondo
            icone="chevron_right"
            tamanho={32}
            rotulo="Ver todas as oportunidades"
            onPress={() => mostrarToast('Oportunidades: em breve')}
          />
        </View>

        <View style={estilos.card}>
          <View style={estilos.linhaCard}>
            <Icone nome="bar_chart" tamanho={20} cor={cores.texto} />
            <Text style={estilos.tituloCard}>Ganhos</Text>
          </View>

          <Text style={estilos.subCard}>
            Tendências de ganhos para viagens em {motorista.cidadeOperacao}
          </Text>
          <Text style={estilos.descCard}>
            Veja quais são os melhores horários e regiões para aceitar viagens
          </Text>

          <View
            style={estilos.grafico}
            accessibilityRole="image"
            accessibilityLabel="Gráfico de tendência de ganhos ao longo do dia; o momento atual está entre os melhores"
          >
            {TENDENCIA.map((altura, i) => (
              <View
                key={i}
                style={[
                  estilos.barra,
                  {
                    height: `${altura}%`,
                    backgroundColor: i === INDICE_AGORA ? '#F3E2B7' : cores.superficieAlta,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* CTA fixo. O `bottom` deixa espaço para a tab bar renderizada pelo App. */}
      <View style={estilos.areaCta} pointerEvents="box-none">
        <BotaoFicarOnline onPress={ficarOnline} />
      </View>
    </Tela>
  );
}

/**
 * BOTÃO "FICAR ONLINE" com pulso em loop (§6.1)
 * ---------------------------------------------
 * O anel expande de 1 → 1,18 e some. É o único elemento animado em loop desta
 * tela — e essa exclusividade é o que faz o olho ir até ele. Se três coisas
 * pulsassem ao mesmo tempo, nenhuma chamaria atenção.
 */
function BotaoFicarOnline({ onPress }) {
  const pulso = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const ciclo = Animated.loop(
      Animated.timing(pulso, {
        toValue: 1,
        duration: tempo.pulso,
        easing: Easing.out(Easing.ease),
        useNativeDriver: DRIVER_NATIVO,
      })
    );
    ciclo.start();
    return () => ciclo.stop();
  }, [pulso]);

  return (
    <View style={estilos.areaBotao}>
      <Animated.View
        pointerEvents="none"
        style={[
          estilos.pulso,
          {
            opacity: pulso.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] }),
            transform: [{ scale: pulso.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] }) }],
          },
        ]}
      />
      <Pressionavel onPress={onPress} accessibilityLabel="Ficar online" style={estilos.cta}>
        <View style={estilos.ctaConteudo}>
          {/* O volante vem do MaterialCommunityIcons — o MaterialIcons não
              tem um. Quem resolve de onde buscar é o componente Icone. */}
          <View style={estilos.ctaIcone}>
            <Icone nome="steering" tamanho={18} cor="#FFFFFF" />
          </View>
          <Text style={estilos.ctaTexto}>Ficar online</Text>
        </View>
      </Pressionavel>
    </View>
  );
}

function BotaoRedondo({ icone, rotulo, onPress, cor = cores.texto, tamanho = 40 }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      hitSlop={8}
      style={({ pressed }) => [
        estilos.redondo,
        { width: tamanho, height: tamanho, borderRadius: tamanho / 2 },
        pressed && { opacity: 0.7 },
      ]}
    >
      <Icone nome={icone} tamanho={tamanho > 34 ? 21 : 19} cor={cor} />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  conteudo: { paddingTop: TOPO_SEGURO, paddingBottom: 200 },

  acoesTopo: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, paddingHorizontal: espaco.md, paddingTop: 8 },
  redondo: { backgroundColor: cores.superficieAlta, alignItems: 'center', justifyContent: 'center' },

  mapa: { marginHorizontal: espaco.md, marginTop: 18 },
  cabecalho: { paddingHorizontal: espaco.md, paddingTop: 14 },
  titulo: { ...tipo.h1, color: cores.texto },
  subtitulo: { ...tipo.corpo, color: cores.textoSecundario, marginTop: 8 },

  linhaSecao: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: espaco.md, paddingTop: 26,
  },
  secao: { ...tipo.h2, color: cores.texto },

  card: {
    margin: espaco.md, marginBottom: 0, marginTop: 14, padding: espaco.md,
    borderRadius: raio.md, backgroundColor: cores.superficie,
    borderWidth: 1, borderColor: cores.borda,
  },
  linhaCard: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tituloCard: { ...tipo.h3, color: cores.texto },
  descCard: { ...tipo.legenda, color: cores.textoSecundario, marginTop: 6 },

  subCard: { ...tipo.corpoForte, color: cores.texto, marginTop: 12 },

  // `alignItems: flex-end` ancora as barras no chão do gráfico: sem isso elas
  // ficariam penduradas no topo, porque em flexbox o padrão é esticar.
  grafico: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
    height: 72, marginTop: 18, gap: 4,
  },
  barra: { flex: 1, borderRadius: 3, minHeight: 4 },

  areaCta: { position: 'absolute', left: 0, right: 0, bottom: 76, paddingHorizontal: espaco.md },
  areaBotao: { alignItems: 'stretch', justifyContent: 'center' },
  pulso: { ...StyleSheet.absoluteFillObject, borderRadius: 26, backgroundColor: cores.acao },
  cta: {
    height: 52, borderRadius: 26, backgroundColor: cores.acao,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: cores.acao, shadowOpacity: 0.35, shadowRadius: 16, shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  ctaConteudo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ctaIcone: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.28)',
    alignItems: 'center', justifyContent: 'center',
  },
  ctaTexto: { ...tipo.h3, color: '#FFFFFF', fontFamily: familia.bold },
});
