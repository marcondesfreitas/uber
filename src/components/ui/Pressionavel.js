import React, { useRef } from 'react';
import { Animated, Pressable } from 'react-native';
import { DRIVER_NATIVO } from '../../theme/animacao';

/**
 * PRESSIONÁVEL — o feedback de toque padrão do app (§6.7)
 * ------------------------------------------------------
 * Encolhe para 0,97 ao ser pressionado e volta com mola ao soltar.
 *
 * Por que isso não é firula: num aparelho, o dedo COBRE o que você tocou.
 * Sem uma reação visível na borda do elemento, o usuário não sabe se o toque
 * foi registrado — e toca de novo. Botão que "afunda" resolve isso em 100 ms.
 *
 * `useNativeDriver: DRIVER_NATIVO` manda a animação para a thread nativa. Isso importa
 * exatamente nos momentos em que o JavaScript está ocupado (abrindo uma tela,
 * recalculando o surge) — que é quando o usuário está tocando.
 */
/**
 * O `style` que este componente recebe vai para a VIEW DE DENTRO, porque é ela
 * que anima. O `Pressable` de fora fica sem estilo — e é ele que participa do
 * layout do pai.
 *
 * Isso é invisível na maioria dos usos (um botão de largura total, uma linha
 * de lista), mas quebra dentro de uma GRADE: mesmo com `flex: 1` no style, o
 * Pressable encolhe até o conteúdo, e cada card fica da largura do próprio
 * texto. Pior, um indicador posicionado com `right: 12` passa a se ancorar
 * nessa caixa estreita em vez da borda da coluna.
 *
 * `preencher` resolve dizendo ao Pressable para ocupar a fatia inteira. É uma
 * prop explícita, e não uma tentativa de adivinhar quais chaves do `style`
 * pertencem a qual camada: adivinhação aqui acerta hoje e erra no dia em que
 * alguém passar uma margem.
 */
const PREENCHER = { flex: 1, alignSelf: 'stretch' };

export default function Pressionavel({
  children,
  onPress,
  escala = 0.97,
  style,
  preencher = false,
  desabilitado = false,
  ...resto
}) {
  const anim = useRef(new Animated.Value(1)).current;

  return (
    <Pressable
      style={preencher ? PREENCHER : undefined}
      onPress={desabilitado ? undefined : onPress}
      onPressIn={() => {
        Animated.spring(anim, { toValue: escala, useNativeDriver: DRIVER_NATIVO, speed: 40 }).start();
      }}
      onPressOut={() => {
        Animated.spring(anim, { toValue: 1, friction: 4, useNativeDriver: DRIVER_NATIVO }).start();
      }}
      accessibilityRole="button"
      accessibilityState={{ disabled: desabilitado }}
      {...resto}
    >
      <Animated.View style={[style, { transform: [{ scale: anim }] }, desabilitado && { opacity: 0.4 }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
