import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import AppBar from '../components/ui/AppBar';
import Botao from '../components/ui/Botao';
import Campo from '../components/ui/Campo';
import CardSelecao from '../components/ui/CardSelecao';
import Tela, { TOPO_SEGURO } from '../components/ui/Tela';
import { useApp } from '../estado/AppProvider';
import { ilustracoesVeiculo } from '../data/mock';
import * as haptica from '../estado/haptica';
import { cores, espaco } from '../theme/cores';
import { tipo } from '../theme/tipografia';

/**
 * GERENCIAR VEÍCULOS (§5.8)
 * -------------------------
 * Segunda etapa do fluxo de veículos. A primeira é `VeiculosScreen`, que mostra
 * qual está ativo hoje; esta é onde se troca.
 * "Qual veículo ficará ativo?" — escolha ÚNICA, por isso `forma="radio"`.
 *
 * Detalhe de comportamento que quase sempre passa batido: ao trocar de carro
 * para moto, os campos abaixo trocam JUNTO. Um formulário que mantém "VOYAGE
 * 1.0" na tela depois de você escolher Moto está mentindo sobre qual registro
 * está sendo editado — e é assim que alguém salva a placa do carro na moto.
 *
 * A troca também dispara um toque háptico leve. Seleção sem feedback tátil
 * parece que não pegou, e o usuário toca de novo (voltando ao item anterior).
 */
export default function GerenciarVeiculosScreen() {
  const { navegar, veiculoAtivo, setVeiculoAtivo, setVeiculo, garagem, mostrarToast } = useApp();

  /**
   * O rascunho parte da GARAGEM, não do mock.
   *
   * Antes ele lia `veiculos[...]` de `data/mock.js` — os dados de fábrica. Com
   * o veículo passando a ser salvo entre sessões, isso viraria um bug visível:
   * o motorista mudaria a placa, reabriria o app e encontraria a placa antiga
   * ao abrir esta tela, porque ela ignorava o que estava guardado.
   *
   * Vale também para a troca: alternar entre carro e moto agora traz o que
   * cada um tinha da última vez, em vez de descartar as edições.
   */
  const [rascunho, setRascunho] = useState(garagem[veiculoAtivo]);

  function escolher(tipoVeiculo) {
    if (tipoVeiculo === rascunho.tipo) return;
    haptica.leve();
    setRascunho(garagem[tipoVeiculo]);
  }

  const definir = (chave) => (valor) => setRascunho((r) => ({ ...r, [chave]: valor }));

  function salvar() {
    setVeiculoAtivo(rascunho.tipo);
    setVeiculo(rascunho);
    navegar('veiculos');
    mostrarToast('Veículo ativo atualizado');
  }

  return (
    <Tela>
      <AppBar titulo="Gerenciar veículos" onVoltar={() => navegar('veiculos')} alturaTopo={TOPO_SEGURO} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >
        <ScrollView
          contentContainerStyle={estilos.conteudo}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={estilos.pergunta}>Qual veículo ficará ativo?</Text>

          <View
            style={estilos.cards}
            accessibilityRole="radiogroup"
          >
            <CardSelecao
              nome="Carro"
              imagem={ilustracoesVeiculo.carro}
              forma="radio"
              selecionado={rascunho.tipo === 'carro'}
              onPress={() => escolher('carro')}
            />
            <CardSelecao
              nome="Moto"
              imagem={ilustracoesVeiculo.moto}
              forma="radio"
              selecionado={rascunho.tipo === 'moto'}
              onPress={() => escolher('moto')}
            />
          </View>

          <View style={estilos.campos}>
            <Campo rotulo="Modelo" valor={rascunho.modelo} onChangeText={definir('modelo')} autoCapitalize="characters" />
            <Campo
              rotulo="Placa"
              valor={rascunho.placa}
              onChangeText={definir('placa')}
              autoCapitalize="characters"
            />
            <Campo rotulo="Cor" valor={rascunho.cor} onChangeText={definir('cor')} autoCapitalize="characters" />
          </View>

          <Botao
            titulo="Salvar e usar este veículo"
            variante="claro"
            onPress={salvar}
            style={{ marginTop: 26 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  conteudo: { paddingHorizontal: espaco.md, paddingTop: 8, paddingBottom: 48 },
  pergunta: { ...tipo.h2, color: cores.texto },
  cards: { flexDirection: 'row', gap: 12, marginTop: 18 },
  campos: { gap: 16, marginTop: 24 },
});
