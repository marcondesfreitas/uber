import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import Icone from '../ui/Icone';
import { cores, raio } from '../../theme/cores';
import { tipo } from '../../theme/tipografia';
import { DRIVER_NATIVO } from '../../theme/animacao';

/**
 * BARRA "PROCURANDO CORRIDA" (§3 `StatusBarOnline`)
 * -------------------------------------------------
 * A barra inferior enquanto o motorista está ocioso, esperando uma viagem.
 *
 * Repare que ela é ESCURA, ao contrário dos sheets da corrida. Isso não é
 * inconsistência: o mundo claro marca "há uma tarefa acontecendo". Esperando,
 * não há tarefa — então a interface recua para o escuro e devolve a tela ao
 * mapa, que é o que o motorista está lendo nesse momento.
 *
 * O RÓTULO MUDA COM O TEMPO
 * -------------------------
 * "Você está online" nos primeiros segundos, depois "Procurando corrida".
 * A explicação está no corpo do componente.
 *
 * O TEXTO É CENTRADO, NÃO ALINHADO À ESQUERDA
 * -------------------------------------------
 * "Procurando corrida" fica no meio, com os dois botões flanqueando. Isso faz
 * a barra ser lida como UM estado do sistema, e não como uma linha de lista
 * com um rótulo à esquerda. É a mesma razão de um player de música centralizar
 * o nome da faixa entre os controles.
 *
 * A BARRA DE PROGRESSO INDETERMINADA
 * ----------------------------------
 * Um traço azul varrendo da esquerda para a direita, em loop. Ele não mede
 * nada — e é exatamente esse o ponto: ninguém sabe quando a próxima corrida
 * chega. Uma barra que fingisse porcentagem estaria mentindo. Barra
 * indeterminada é a forma honesta de dizer "estou trabalhando, sem previsão".
 */
export default function BarraOnline({ onPreferencias, onMenu }) {
  const varredura = useRef(new Animated.Value(0)).current;

  /**
   * O rótulo muda depois de alguns segundos: "Você está online" → "Procurando
   * corrida". É assim no vídeo, e a sequência tem lógica.
   *
   * A primeira frase CONFIRMA a ação que a pessoa acabou de fazer (ela tocou
   * em "Ficar online" e quer saber se deu certo). Passado esse instante, a
   * confirmação perde a validade e o que interessa é o que o app está fazendo
   * AGORA. Uma tela que continua confirmando algo de dois minutos atrás está
   * gastando o espaço mais nobre com informação vencida.
   */
  const [rotulo, setRotulo] = useState('Você está online');

  useEffect(() => {
    const t = setTimeout(() => setRotulo('Procurando corrida'), 2600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const ciclo = Animated.loop(
      Animated.timing(varredura, {
        toValue: 1,
        duration: 1800,
        easing: Easing.bezier(0.4, 0, 0.6, 1),
        useNativeDriver: DRIVER_NATIVO,
      })
    );
    ciclo.start();
    return () => ciclo.stop();
  }, [varredura]);

  return (
    <View style={estilos.barra}>
      <BotaoLateral icone="tune" rotulo="Preferências de viagem" onPress={onPreferencias} />

      <View style={estilos.meio}>
        <Text
          style={estilos.titulo}
          // Anuncia a mudança de estado sem roubar o foco de quem usa
          // leitor de tela — é o papel de uma mensagem de status.
          accessibilityLiveRegion="polite"
        >
          {rotulo}
        </Text>

        <View style={estilos.trilho}>
          <Animated.View
            style={[
              estilos.varredura,
              {
                transform: [
                  {
                    // Vai de -100% a +320% da largura do trilho. Como o
                    // translateX percentual se refere à largura do PRÓPRIO
                    // elemento (32% do trilho), esses números levam o traço
                    // de fora da borda esquerda até fora da direita.
                    translateX: varredura.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['-100%', '320%'],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
      </View>

      <BotaoLateral icone="menu" rotulo="Mais opções" onPress={onMenu} />
    </View>
  );
}

function BotaoLateral({ icone, rotulo, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      hitSlop={8}
      style={({ pressed }) => [estilos.lateral, pressed && { opacity: 0.6 }]}
    >
      <Icone nome={icone} tamanho={26} cor={cores.texto} />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  barra: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    flexDirection: 'row', alignItems: 'center', gap: 16,
    paddingHorizontal: 22, paddingTop: 22, paddingBottom: 34,
    backgroundColor: cores.fundo,
    borderTopLeftRadius: raio.sheet, borderTopRightRadius: raio.sheet,
    shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 32, shadowOffset: { width: 0, height: -8 },
    elevation: 16,
    zIndex: 14,
  },
  // Sem fundo circular: no vídeo os dois ícones flutuam soltos sobre a barra.
  lateral: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  meio: { flex: 1, minWidth: 0, alignItems: 'center' },
  titulo: { ...tipo.corpoForte, color: cores.texto },
  trilho: {
    height: 5, borderRadius: 3, backgroundColor: cores.superficieAlta,
    overflow: 'hidden', marginTop: 10, alignSelf: 'stretch',
  },
  varredura: { width: '32%', height: 5, borderRadius: 3, backgroundColor: cores.acao },
});
