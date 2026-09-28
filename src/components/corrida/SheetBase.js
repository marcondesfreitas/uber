import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import { claro, raio, tempo } from '../../theme/cores';
import { DRIVER_NATIVO } from '../../theme/animacao';

/**
 * SHEET BASE — a superfície clara que sobe sobre o mapa (§6.3)
 * -----------------------------------------------------------
 * Todos os painéis do fluxo da corrida herdam daqui: entram de baixo em
 * 320 ms com a curva `cubic-bezier(.22,1,.36,1)`.
 *
 * O OVERSHOOT
 * -----------
 * Essa curva passa levemente do destino e volta. Parece detalhe de vaidade e
 * não é: um objeto que para SECO no lugar parece uma imagem trocada; um que
 * desacelera com um leve exagero parece um objeto físico chegando. É o que
 * faz o sheet ser lido como "algo subiu" em vez de "a tela mudou".
 *
 * No React Native usamos `Easing.bezier(0.22, 1, 0.36, 1)` — os mesmos quatro
 * números do CSS. A API muda, a curva é a mesma.
 *
 * `useNativeDriver` está ligado porque só animamos `translateY`. Se algum dia
 * você precisar animar a ALTURA do sheet, terá de desligá-lo — e aí vale
 * repensar: animar altura força relayout a cada frame, o que engasga sobre um
 * mapa. Prefira mover o sheet inteiro.
 */
export default function SheetBase({ children, style, aoConcluir }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const a = Animated.timing(anim, {
      toValue: 1,
      duration: tempo.sheet,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
      useNativeDriver: DRIVER_NATIVO,
    });
    a.start(aoConcluir);
    return () => a.stop();
  }, [anim, aoConcluir]);

  // 600 é um valor maior que qualquer sheet do app: garante que ele comece
  // totalmente fora da tela, independentemente da própria altura (que só é
  // conhecida depois do layout).
  const y = anim.interpolate({ inputRange: [0, 1], outputRange: [600, 0] });

  return (
    <Animated.View style={[estilos.sheet, { transform: [{ translateY: y }] }, style]}>
      {children}
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: claro.superficie,
    borderTopLeftRadius: raio.sheet,
    borderTopRightRadius: raio.sheet,
    // A sombra sobe (offset negativo) porque a luz vem de cima: o sheet
    // projeta sombra no mapa que está ATRÁS e ACIMA dele.
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: -8 },
    elevation: 24,
    zIndex: 20,
  },
});
