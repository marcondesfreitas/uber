import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import Icone from '../components/ui/Icone';
import Tela, { TOPO_SEGURO } from '../components/ui/Tela';
import { useApp } from '../estado/AppProvider';
import { claro, cores } from '../theme/cores';
import { tipo } from '../theme/tipografia';
import { DRIVER_NATIVO } from '../theme/animacao';

/**
 * FICANDO ONLINE… (§5.11) — a tela que troca de mundo
 * ---------------------------------------------------
 * Fundo CLARO no meio de um app escuro. Isso é o produto avisando, sem
 * palavras, que você acabou de sair do modo "mexer no app" e entrou no modo
 * "trabalhar". A tela de mapa que vem depois herda essa lógica: superfícies
 * claras flutuando sobre o escuro.
 *
 * Por que uma tela de espera em vez de ir direto ao mapa: pegar o primeiro
 * ponto de GPS leva de 1 a 5 segundos com o aparelho parado. Sem esta tela, o
 * usuário toca "Ficar online" e olha para um mapa cinza sem saber se travou.
 *
 * O X no canto é obrigatório. Toda espera precisa de saída — inclusive as
 * curtas, porque a pessoa pode ter tocado por engano no trânsito.
 */
export default function FicandoOnlineScreen() {
  const { navegar } = useApp();
  const giro = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const ciclo = Animated.loop(
      Animated.timing(giro, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: DRIVER_NATIVO,
      })
    );
    ciclo.start();
    return () => ciclo.stop();
  }, [giro]);

  const rotacao = giro.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Tela tema="claro">
      <Pressable
        onPress={() => navegar('inicio')}
        accessibilityRole="button"
        accessibilityLabel="Cancelar e voltar"
        hitSlop={8}
        style={({ pressed }) => [estilos.fechar, pressed && { opacity: 0.6 }]}
      >
        <Icone nome="close" tamanho={22} cor={claro.texto} />
      </Pressable>

      <View style={estilos.centro}>
        {/* O anel: um círculo com borda quase transparente e o TOPO opaco.
            Ao girar, só o arco colorido se move — é assim que todo spinner
            circular é feito, sem imagem nenhuma. */}
        <Animated.View style={[estilos.anel, { transform: [{ rotate: rotacao }] }]} />

        <Text
          style={estilos.titulo}
          accessibilityRole="header"
          // Anuncia a mudança sem roubar o foco de quem usa leitor de tela.
          accessibilityLiveRegion="polite"
        >
          Ficando online…
        </Text>
        <Text style={estilos.subtitulo}>Preparando o mapa e procurando viagens.</Text>
      </View>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  fechar: {
    position: 'absolute', top: TOPO_SEGURO + 10, left: 16, zIndex: 2,
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  anel: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 5,
    borderColor: 'rgba(62,111,240,0.18)',
    borderTopColor: cores.acao,
  },
  titulo: { ...tipo.h2, color: claro.texto, marginTop: 26 },
  subtitulo: { ...tipo.corpo, color: claro.textoSecundario, marginTop: 8, textAlign: 'center' },
});
