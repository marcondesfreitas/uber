import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Heatmap, Marker } from 'react-native-maps';
import { PALETA_DEMANDA, corSolida } from '../services/precoDinamico';
import { raio } from '../theme/cores';
import { tipo } from '../theme/tipografia';

/**
 * CAMADA DE DEMANDA SOBRE O MAPA
 * ==============================
 * Manchas de calor + pills flutuantes com o tempo de espera.
 *
 * POR QUE HEATMAP E NÃO POLÍGONOS
 * -------------------------------
 * A primeira versão desenhava um `<Polygon>` por célula da grade. Funcionava,
 * mas denunciava o truque: dava para contar os quadrados, e a demanda real não
 * tem bordas retas.
 *
 * O `<Heatmap>` recebe PONTOS COM PESO e desenha um campo contínuo, misturando
 * os vizinhos. É mais fiel ao fenômeno: demanda é uma superfície, não um
 * mosaico. A grade continua existindo por baixo — ela é como o simulador do
 * Módulo 1.5 organiza o cálculo — mas deixou de ser o que o motorista vê.
 *
 * Isso é uma distinção que vale levar para qualquer visualização: a estrutura
 * de DADOS (grade de células) e a estrutura VISUAL (campo contínuo) não
 * precisam ser a mesma coisa, e forçar isso costuma ser o que faz um gráfico
 * parecer amador.
 *
 * O QUE SE PERDE, E COMO COMPENSAMOS
 * ----------------------------------
 * Polígono aceita toque; mancha de calor, não. Se parássemos aqui, o motorista
 * perderia o painel com pedidos/motoristas/multiplicador — que é justamente a
 * lição do Módulo 1.5.
 *
 * Por isso as PILLS são tocáveis. E isso acabou melhor que o desenho original:
 * antes você tinha de adivinhar qual quadrado valia tocar; agora o app já
 * aponta as zonas quentes, e o alvo é visível.
 *
 * A PILL MOSTRA TEMPO, NÃO MULTIPLICADOR
 * --------------------------------------
 * "↗ 1-4 min" em vez de "1.8x". O motorista decide PARA ONDE IR, e a pergunta
 * que responde isso é "em quanto tempo eu pego uma corrida ali?" — não "qual o
 * multiplicador". O número técnico continua a um toque, no PainelZona.
 */
export default function CamadaDemanda({ zonas, onSelecionarZona, maxRotulos = 6 }) {
  /**
   * Os pontos do heatmap. Peso = quão quente está a célula.
   *
   * Usamos `multiplicadorInterno` (o valor contínuo da EMA) em vez do exibido:
   * o exibido passa por zona morta e arredondamento em degraus de 0,1, e
   * degraus num campo contínuo produzem anéis visíveis — o mesmo artefato de
   * "banding" que aparece num gradiente com poucas cores.
   */
  const pontos = React.useMemo(
    () =>
      zonas
        .filter((z) => z.nivel > 0)
        .map((z) => ({
          latitude: z.centro.latitude,
          longitude: z.centro.longitude,
          weight: Math.max(0.1, (z.multiplicadorInterno || z.multiplicador) - 1),
        })),
    [zonas]
  );

  /**
   * Quais células ganham pill.
   *
   * Não basta pegar as 6 mais quentes: as vizinhas costumam ter valores
   * parecidos (é o mesmo foco de demanda), e seis pills empilhadas no mesmo
   * quarteirão viram um borrão. Por isso descartamos candidatas grudadas numa
   * já escolhida — o problema que cartógrafos chamam de "declutter" de rótulos.
   */
  const comRotulo = React.useMemo(() => {
    const candidatas = zonas
      .filter((z) => z.nivel >= 2)
      .sort((a, b) => b.multiplicador - a.multiplicador);

    const escolhidas = [];
    for (const z of candidatas) {
      if (escolhidas.length >= maxRotulos) break;
      const perto = escolhidas.some(
        (e) =>
          Math.abs(e.centro.latitude - z.centro.latitude) < 0.008 &&
          Math.abs(e.centro.longitude - z.centro.longitude) < 0.008
      );
      if (!perto) escolhidas.push(z);
    }
    return escolhidas;
  }, [zonas, maxRotulos]);

  if (pontos.length === 0) return null;

  return (
    <>
      <Heatmap
        points={pontos}
        // O raio é em PIXELS de tela, não em metros — e o Android só aceita
        // de 10 a 50. Valor alto demais borra tudo numa mancha só; baixo
        // demais devolve o aspecto de pontinhos separados.
        radius={50}
        opacity={0.72}
        gradient={{
          // A mesma rampa amarelo→roxo da paleta, agora como gradiente
          // contínuo. O primeiro ponto é transparente para as áreas frias
          // não ganharem um véu sobre as ruas.
          colors: ['#F2B33D00', '#F2B33D', '#E8873A', '#D9484B', '#A8327D', '#6E2BB5'],
          startPoints: [0.01, 0.15, 0.35, 0.55, 0.75, 1],
          colorMapSize: 256,
        }}
      />

      {comRotulo.map((zona) => {
        const faixa = PALETA_DEMANDA[zona.nivel];
        if (!faixa.eta) return null;

        return (
          <Marker
            key={zona.id}
            coordinate={zona.centro}
            anchor={{ x: 0.5, y: 0.5 }}
            // Performance: sem isto, cada Marker com conteúdo React
            // re-renderiza sua imagem continuamente e o mapa engasga. É O erro
            // de performance nº 1 com react-native-maps.
            tracksViewChanges={false}
            onPress={() => onSelecionarZona && onSelecionarZona(zona)}
          >
            <View style={[estilos.pill, { backgroundColor: corSolida(zona.nivel) }]}>
              <Text style={estilos.pillTexto}>↗ {faixa.eta}</Text>
            </View>
          </Marker>
        );
      })}
    </>
  );
}

const estilos = StyleSheet.create({
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: raio.redondo,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  pillTexto: { ...tipo.micro, color: '#FFFFFF' },
});
