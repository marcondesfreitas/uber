import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { cores } from '../theme/cores';
import { familia, tipo } from '../theme/tipografia';
import { semana } from '../data/mock';
import { DRIVER_NATIVO } from '../theme/animacao';

const ALTURA = 64;

/**
 * BARRAS DA SEMANA (§3 `WeekBars`)
 * --------------------------------
 * Sete barras, uma por dia, com as letras S T Q Q S S D.
 *
 * O ESTADO VAZIO É O PADRÃO — e essa é a parte interessante. Quem acabou de
 * instalar o app vê R$ 0,00 e sete barras TRACEJADAS de altura cheia, não um
 * gráfico em branco nem barras zeradas coladas no chão.
 *
 * Por quê: barra de altura zero comunica "você não ganhou nada" com um tom de
 * fracasso. Contorno tracejado comunica "aqui vai aparecer o seu resultado" —
 * é um espaço reservado, não um placar. A diferença é de produto, não de
 * design: uma versão desanima, a outra explica.
 *
 * As barras crescem com `scaleY` a partir da base. Animar `height` faria o
 * layout recalcular a cada frame; `transform` roda na thread nativa.
 */
export default function BarrasSemana({ comDados }) {
  const anim = useRef(new Animated.Value(comDados ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: comDados ? 1 : 0,
      duration: 420,
      useNativeDriver: DRIVER_NATIVO,
    }).start();
  }, [comDados, anim]);

  return (
    <View
      style={estilos.area}
      accessibilityRole="image"
      accessibilityLabel={
        comDados
          ? 'Gráfico dos ganhos da semana, com sábado como maior dia'
          : 'Gráfico da semana ainda sem dados'
      }
    >
      {semana.dias.map((dia, i) => {
        const hoje = i === semana.indiceHoje;
        const alturaFinal = (semana.alturas[i] / 100) * ALTURA;

        return (
          <View key={`${dia}-${i}`} style={estilos.coluna}>
            <View style={estilos.trilho}>
              {/* Contorno tracejado: some quando os dados chegam. */}
              <Animated.View
                style={[estilos.tracejada, { opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }]}
              />
              {/* Barra preenchida: cresce do chão para cima. */}
              <Animated.View
                style={[
                  estilos.preenchida,
                  {
                    height: alturaFinal,
                    backgroundColor: hoje ? cores.online : cores.acao,
                    opacity: anim,
                    // scaleY escala a partir do CENTRO. Sem compensar, a barra
                    // cresceria para os dois lados e atravessaria a base do
                    // gráfico. O translateY devolve a metade que subiu.
                    // (Existe `transformOrigin` em versões recentes do RN;
                    // esta forma funciona em qualquer uma.)
                    transform: [
                      { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [alturaFinal / 2, 0] }) },
                      { scaleY: anim },
                    ],
                  },
                ]}
              />
            </View>
            <Text style={[estilos.dia, comDados && hoje && { color: cores.online }]}>{dia}</Text>
          </View>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  area: { flexDirection: 'row', alignItems: 'flex-end', gap: 5, height: ALTURA + 18 },
  coluna: { alignItems: 'center', gap: 5 },
  trilho: { width: 9, height: ALTURA, justifyContent: 'flex-end' },
  tracejada: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(62,111,240,0.55)',
    borderRadius: 5,
  },
  preenchida: { width: 9, borderRadius: 5 },
  dia: { fontSize: 10, fontFamily: familia.semi, color: cores.textoTerciario },
});
