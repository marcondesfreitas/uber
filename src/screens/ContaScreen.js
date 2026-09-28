import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import AppBar from '../components/ui/AppBar';
import LinhaLista from '../components/ui/LinhaLista';
import Tela, { TOPO_SEGURO } from '../components/ui/Tela';
import { useApp } from '../estado/AppProvider';
import { linhasConta } from '../data/mock';
import { cores, espaco } from '../theme/cores';
import { tipo } from '../theme/tipografia';

/**
 * CONTA (§5.6)
 * ------------
 * Onze linhas de navegação. A PRIMEIRA é diferente: tem subtítulo com o
 * veículo ativo.
 *
 * Por que quebrar o padrão logo na primeira linha: o veículo ativo é o único
 * item desta lista que muda a operação do dia (é o carro que o passageiro vai
 * procurar). Mostrar o valor atual sem precisar entrar poupa um toque na
 * informação mais consultada — e o custo é uma inconsistência visual de uma
 * linha só, que o olho lê como "esta é especial", não como erro.
 *
 * As linhas com `destino: null` mostram um toast em vez de navegar. Isso é
 * honestidade de protótipo: um botão que não faz NADA ao ser tocado faz o
 * usuário achar que o app travou.
 */
export default function ContaScreen() {
  const { navegar, veiculo, mostrarToast } = useApp();

  return (
    <Tela>
      <AppBar titulo="" onVoltar={() => navegar('menu')} alturaTopo={TOPO_SEGURO} />

      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
        <Text style={estilos.titulo}>Conta</Text>

        <LinhaLista
          icone="directions_car"
          titulo="Veículos"
          subtitulo={`${veiculo.modelo} ${veiculo.placa}`}
          onPress={() => navegar('veiculos')}
          divisor
        />

        {linhasConta.map((l) => (
          <LinhaLista
            key={l.label}
            icone={l.icone}
            titulo={l.label}
            onPress={() =>
              l.destino ? navegar(l.destino) : mostrarToast(`${l.label}: em breve`)
            }
            divisor
          />
        ))}
      </ScrollView>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  conteudo: { paddingBottom: 110 },
  titulo: { ...tipo.h1, color: cores.texto, paddingHorizontal: espaco.md, paddingTop: 6, paddingBottom: 14 },
});
