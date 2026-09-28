import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { raio, tempo } from '../../theme/cores';
import { familia, tipo } from '../../theme/tipografia';
import { DRIVER_NATIVO } from '../../theme/animacao';

/**
 * TOAST (§6.8) — pill escuro, entra em 240 ms, fica 2,4 s
 * ------------------------------------------------------
 * Serve para confirmar o que ACABOU de acontecer ("Viagem recusada",
 * "Perfil atualizado"). Nunca para pedir uma decisão: some sozinho, e uma
 * pergunta que desaparece é uma pergunta perdida — isso é diálogo.
 *
 * `pointerEvents="none"` é obrigatório: sem isso, o toast flutuando sobre o
 * mapa engole os toques na área dele por 2,4 segundos, e o usuário jura que
 * o app travou.
 *
 * Quem controla o tempo de vida é o AppProvider; aqui só animamos a entrada.
 */
export default function Toast({ mensagem, style }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: tempo.padrao,
      useNativeDriver: DRIVER_NATIVO,
    }).start();
  }, [mensagem, anim]);

  if (!mensagem) return null;

  const y = anim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] });

  return (
    <Animated.View
      pointerEvents="none"
      // O leitor de tela anuncia sem mover o foco — é exatamente o papel
      // de uma mensagem de status.
      accessibilityLiveRegion="polite"
      style={[estilos.area, { opacity: anim, transform: [{ translateY: y }] }, style]}
    >
      <Text style={estilos.texto}>{mensagem}</Text>
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  area: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 104,
    alignItems: 'center',
    zIndex: 80,
  },
  texto: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: raio.lg,
    backgroundColor: 'rgba(34,34,42,0.97)',
    color: '#FFFFFF',
    ...tipo.legenda,
    fontFamily: familia.semi,
    textAlign: 'center',
    overflow: 'hidden', // sem isso o Android ignora o borderRadius no Text
  },
});
