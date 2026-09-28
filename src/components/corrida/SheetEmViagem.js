import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import SheetBase from './SheetBase';
import Botao from '../ui/Botao';
import { corridaExemplo } from '../../data/mock';
import { claro } from '../../theme/cores';
import { brl, familia, tipo } from '../../theme/tipografia';

/**
 * EM VIAGEM (§5.14)
 * -----------------
 * O sheet mais enxuto do fluxo, porque é o momento em que o motorista MENOS
 * pode olhar para a tela. Três informações e um botão.
 *
 * O GANHO PARCIAL sobe em tempo real. Ele é cosmético (o valor final já está
 * definido) e ainda assim é o elemento que mais importa emocionalmente — é o
 * feedback de que o trabalho está rendendo agora.
 *
 * Repare no `fontVariant: tabular-nums`: sem ele, um número que muda a cada
 * 350 ms faria o texto inteiro "tremer" horizontalmente, porque o "1" é mais
 * estreito que o "8" na fonte padrão. É a diferença entre um contador e um
 * defeito.
 */
export default function SheetEmViagem({ ganho, onFinalizar }) {
  const c = corridaExemplo;

  return (
    <SheetBase style={estilos.sheet}>
      <View style={estilos.topo}>
        <View style={estilos.destino}>
          <Text style={estilos.rotulo}>Em viagem</Text>
          <Text style={estilos.endereco}>{c.destino.curto}</Text>
          <Text style={estilos.detalhe}>
            {`${c.destino.eta} (${c.destino.dist}) · ${c.destino.bairro}`}
          </Text>
        </View>

        <View style={estilos.ganhoArea}>
          <Text style={estilos.ganhoRotulo}>Ganho parcial</Text>
          <Text style={estilos.ganho} accessibilityLabel={`Ganho parcial de ${brl(ganho)}`}>
            {brl(ganho)}
          </Text>
        </View>
      </View>

      <Botao titulo="Finalizar viagem" onPress={onFinalizar} style={{ marginTop: 18 }} />
    </SheetBase>
  );
}

const estilos = StyleSheet.create({
  sheet: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 26 },

  topo: { flexDirection: 'row', alignItems: 'flex-start' },
  destino: { flex: 1, minWidth: 0 },
  rotulo: { ...tipo.secao, color: claro.textoSecundario },
  endereco: { ...tipo.h3, color: claro.texto, marginTop: 4 },
  detalhe: { ...tipo.legenda, color: claro.textoSecundario, marginTop: 2 },

  ganhoArea: { alignItems: 'flex-end', marginLeft: 12 },
  ganhoRotulo: { ...tipo.micro, color: claro.textoSecundario },
  ganho: { fontSize: 22, fontFamily: familia.extra, color: claro.positivo, fontVariant: ['tabular-nums'] },
});
