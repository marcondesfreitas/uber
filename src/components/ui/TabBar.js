import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icone from './Icone';
import { cores } from '../../theme/cores';
import { tipo } from '../../theme/tipografia';

/** Os cinco destinos permanentes do app (§3). */
export const ABAS = [
  { chave: 'inicio', label: 'Página inicial', icone: 'home' },
  { chave: 'descubra', label: 'Descubra', icone: 'explore' },
  { chave: 'ganhos', label: 'Ganhos', icone: 'bar_chart' },
  { chave: 'msg', label: 'Mensagens', icone: 'chat_bubble' },
  { chave: 'menu', label: 'Menu', icone: 'menu' },
];

/**
 * TAB BAR
 * -------
 * Só aparece no MUNDO DE GESTÃO (Início, Ganhos, Menu). Durante a direção ela
 * some — e essa ausência é intencional: com uma corrida em andamento, o
 * motorista tem exatamente uma tarefa, e oferecer cinco saídas ao lado do
 * volante é convite a erro.
 *
 * A cor sozinha não marca a aba ativa para quem tem baixa visão, então o item
 * ativo também carrega `accessibilityState={{ selected: true }}` (§9).
 */
export default function TabBar({ ativa, onSelecionar, alturaBase = 20 }) {
  return (
    <View style={[estilos.barra, { paddingBottom: alturaBase }]}>
      {ABAS.map((aba) => {
        const selecionada = ativa === aba.chave;
        const cor = selecionada ? cores.texto : cores.textoTerciario;

        return (
          <Pressable
            key={aba.chave}
            onPress={() => onSelecionar(aba.chave)}
            accessibilityRole="tab"
            accessibilityState={{ selected: selecionada }}
            accessibilityLabel={aba.label}
            style={estilos.item}
          >
            <Icone nome={aba.icone} tamanho={22} cor={cor} />
            <Text style={[estilos.label, { color: cor }]}>{aba.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  barra: {
    flexDirection: 'row',
    backgroundColor: 'rgba(11,11,15,0.96)',
    borderTopWidth: 1,
    borderTopColor: '#1E1E25',
    paddingTop: 8,
  },
  item: { flex: 1, alignItems: 'center', gap: 3 },
  label: { ...tipo.micro },
});
