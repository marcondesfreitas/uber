import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { cores, raio, tempo } from '../../theme/cores';
import { DRIVER_NATIVO } from '../../theme/animacao';

/**
 * ALTERNADOR / TOGGLE (§3) — trilho 52×32
 * ---------------------------------------
 * A bolinha desliza da esquerda para a direita com `translateX`.
 *
 * Repare no que NÃO fizemos: trocar `justifyContent` de flex-start para
 * flex-end. Isso funcionaria — e teleportaria a bolinha, sem animação.
 * Layout não anima; `transform` anima. Essa distinção vale para o app inteiro.
 *
 * `accessibilityRole="switch"` faz o leitor de tela anunciar "ativado /
 * desativado" em vez de "botão", que é o que a pessoa precisa ouvir aqui.
 */
export default function Alternador({ ligado, onAlternar, rotulo }) {
  const anim = useRef(new Animated.Value(ligado ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: ligado ? 1 : 0,
      duration: tempo.rapido,
      useNativeDriver: DRIVER_NATIVO,
    }).start();
  }, [ligado, anim]);

  const x = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 20] });

  return (
    <Pressable
      onPress={onAlternar}
      accessibilityRole="switch"
      accessibilityState={{ checked: ligado }}
      accessibilityLabel={rotulo}
      hitSlop={8}
      style={[estilos.trilha, { backgroundColor: ligado ? cores.acao : cores.superficieAlta }]}
    >
      <Animated.View
        style={[
          estilos.botao,
          { backgroundColor: ligado ? '#FFFFFF' : cores.textoTerciario, transform: [{ translateX: x }] },
        ]}
      />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  // alignItems controla o eixo HORIZONTAL aqui (flexDirection é 'column'
  // por padrão no RN). É ele que ancora a bolinha à esquerda para o
  // translateX ter de onde partir.
  trilha: {
    width: 52, height: 32, borderRadius: raio.pill, padding: 3,
    justifyContent: 'center', alignItems: 'flex-start',
  },
  botao: { width: 26, height: 26, borderRadius: 13 },
});
