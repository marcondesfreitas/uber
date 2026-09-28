import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icone from './Icone';
import { cores } from '../../theme/cores';
import { tipo } from '../../theme/tipografia';

/**
 * APP BAR (§3)
 * ------------
 * ← 24 px · título centralizado · ação opcional à direita.
 *
 * O truque do TÍTULO CENTRADO: o botão da esquerda tem largura fixa (40) e
 * existe um espaçador da MESMA largura à direita quando não há ação. Sem esse
 * espaçador, `flex: 1` no título centraliza no espaço RESTANTE — ou seja,
 * 20 px deslocado para a direita. É o desalinhamento mais comum em header
 * de app, e ninguém enxerga até comparar duas telas lado a lado.
 *
 * `variante="modal"` troca a seta por um X: seta significa "volto um passo",
 * X significa "fecho esta camada inteira". Usar um pelo outro faz o usuário
 * perder a noção de onde está na pilha.
 */
export default function AppBar({ titulo, onVoltar, variante = 'padrao', acao, alturaTopo = 56 }) {
  return (
    <View style={[estilos.barra, { paddingTop: alturaTopo }]}>
      {onVoltar ? (
        <Pressable
          onPress={onVoltar}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={variante === 'modal' ? 'Fechar' : 'Voltar'}
          style={({ pressed }) => [estilos.botao, pressed && { opacity: 0.5 }]}
        >
          <Icone nome={variante === 'modal' ? 'close' : 'arrow_back'} tamanho={24} cor={cores.texto} />
        </Pressable>
      ) : (
        <View style={estilos.botao} />
      )}

      <Text style={estilos.titulo} numberOfLines={1}>
        {titulo}
      </Text>

      {/* Espaçador que espelha o botão da esquerda — é isso que centraliza. */}
      {acao || <View style={estilos.botao} />}
    </View>
  );
}

const estilos = StyleSheet.create({
  barra: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 12 },
  botao: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  titulo: { ...tipo.h3, color: cores.texto, flex: 1, textAlign: 'center' },
});
