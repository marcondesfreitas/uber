import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { cores, espaco, fonte, raio } from '../theme/cores';
import { DRIVER_NATIVO } from '../theme/animacao';

/**
 * BOTÃO ONLINE/OFFLINE — primeiro contato com ANIMAÇÕES
 * ------------------------------------------------------
 * Duas animações acontecem aqui:
 *
 * 1) PULSO (loop): quando o motorista está online, um círculo cresce e some
 *    atrás do botão, repetindo para sempre. Comunica "estou ativo, procurando".
 * 2) PRESSIONAR: o botão encolhe levemente ao ser tocado (feedback tátil visual).
 *
 * Conceitos do Animated:
 *  - Animated.Value: um número que a animação altera fora do ciclo do React.
 *  - useNativeDriver: DRIVER_NATIVO → a animação roda na thread nativa = 60fps mesmo
 *    se o JavaScript estiver ocupado. Só funciona para transform e opacity.
 *  - interpolate: transforma o intervalo 0→1 em qualquer outro (escala, cor...).
 */
export default function BotaoOnline({ online, onAlternar }) {
  const pulso = useRef(new Animated.Value(0)).current;
  const escala = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!online) {
      pulso.setValue(0);
      return;
    }
    const animacao = Animated.loop(
      Animated.timing(pulso, {
        toValue: 1,
        duration: 1800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: DRIVER_NATIVO,
      })
    );
    animacao.start();
    return () => animacao.stop();
  }, [online, pulso]);

  const escalaPulso = pulso.interpolate({ inputRange: [0, 1], outputRange: [1, 2.4] });
  const opacidadePulso = pulso.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] });

  function aoPressionar() {
    Animated.spring(escala, { toValue: 0.92, useNativeDriver: DRIVER_NATIVO }).start();
  }
  function aoSoltar() {
    Animated.spring(escala, { toValue: 1, friction: 4, useNativeDriver: DRIVER_NATIVO }).start();
  }

  return (
    <View style={estilos.area} pointerEvents="box-none">
      {online && (
        <Animated.View
          style={[
            estilos.pulso,
            { transform: [{ scale: escalaPulso }], opacity: opacidadePulso },
          ]}
        />
      )}

      <Animated.View style={{ transform: [{ scale: escala }] }}>
        <Pressable
          onPressIn={aoPressionar}
          onPressOut={aoSoltar}
          onPress={onAlternar}
          style={[
            estilos.botao,
            { backgroundColor: online ? cores.online : cores.superficieAlta },
          ]}
          accessibilityRole="button"
          accessibilityLabel={online ? 'Ficar offline' : 'Ficar online'}
        >
          <Text style={[estilos.texto, { color: online ? '#06210F' : cores.texto }]}>
            {online ? 'ONLINE' : 'INICIAR'}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const TAMANHO = 86;

const estilos = StyleSheet.create({
  area: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulso: {
    position: 'absolute',
    width: TAMANHO,
    height: TAMANHO,
    borderRadius: raio.redondo,
    backgroundColor: cores.online,
  },
  botao: {
    width: TAMANHO,
    height: TAMANHO,
    borderRadius: raio.redondo,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: cores.borda,
    // Sombra: iOS usa shadow*, Android usa elevation
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  texto: {
    ...fonte.legenda,
    letterSpacing: 1,
    paddingHorizontal: espaco.xs,
  },
});
