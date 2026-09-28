import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PALETA_DEMANDA } from '../services/precoDinamico';
import { cores, espaco, fonte, raio } from '../theme/cores';

/**
 * LEGENDA + INTERRUPTOR DA CAMADA
 * -------------------------------
 * Toda camada de dado colorida PRECISA de legenda. Sem ela o usuário fica
 * adivinhando o que laranja significa — e o dado vira decoração.
 *
 * O botão de ligar/desligar também não é enfeite: informação sobreposta ao
 * mapa atrapalha quando o motorista está navegando. Quem decide é ele.
 */
export default function LegendaDemanda({ visivel, onAlternar }) {
  return (
    <View style={estilos.area}>
      <Pressable
        onPress={onAlternar}
        style={[estilos.botao, visivel && estilos.botaoAtivo]}
        accessibilityRole="switch"
        accessibilityState={{ checked: visivel }}
      >
        <Text style={[estilos.botaoTexto, visivel && estilos.botaoTextoAtivo]}>
          {visivel ? '🔥 Demanda' : '🔥 Ver demanda'}
        </Text>
      </Pressable>

      {visivel && (
        <View style={estilos.legenda}>
          {PALETA_DEMANDA.slice(1).map((faixa) => (
            <View key={faixa.rotulo} style={estilos.item}>
              <View style={[estilos.amostra, { backgroundColor: faixa.borda }]} />
              <Text style={estilos.itemTexto}>{faixa.rotulo}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  area: { alignItems: 'flex-end', gap: espaco.sm },
  botao: {
    backgroundColor: cores.vidro,
    borderWidth: 1,
    borderColor: cores.borda,
    paddingVertical: espaco.sm,
    paddingHorizontal: espaco.md,
    borderRadius: raio.redondo,
  },
  botaoAtivo: { borderColor: cores.alerta },
  botaoTexto: { ...fonte.legenda, color: cores.textoSecundario },
  botaoTextoAtivo: { color: cores.texto },
  legenda: {
    backgroundColor: cores.vidro,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio.md,
    padding: espaco.sm,
    gap: espaco.xs,
  },
  item: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
  amostra: { width: 12, height: 12, borderRadius: 3 },
  itemTexto: { ...fonte.legenda, color: cores.textoSecundario },
});
