import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Alternador from '../components/ui/Alternador';
import AppBar from '../components/ui/AppBar';
import Botao from '../components/ui/Botao';
import Chip from '../components/ui/Chip';
import Tela, { TOPO_SEGURO } from '../components/ui/Tela';
import { useApp } from '../estado/AppProvider';
import { PALETA_DEMANDA, corSolida } from '../services/precoDinamico';
import { claro, cores, espaco, raio } from '../theme/cores';
import { familia, tipo } from '../theme/tipografia';

/**
 * DESIGN SYSTEM — a tela que documenta o app dentro do app
 * -------------------------------------------------------
 * Não é enfeite nem "página de créditos". Ela tem duas funções concretas:
 *
 * 1) É O TESTE VISUAL. Toda cor, tamanho e componente aparecem juntos numa
 *    tela só. Quando você muda um token em `theme/cores.js`, é aqui que vê o
 *    efeito em dez lugares de uma vez — inclusive nos que você esqueceu.
 *    Um contraste que quebrou some no meio do app; aqui salta.
 *
 * 2) É A DOCUMENTAÇÃO QUE NÃO ENVELHECE. Um PDF de style guide desatualiza no
 *    primeiro commit. Esta tela importa os MESMOS tokens que o app usa, então
 *    ela é sempre verdade por construção.
 *
 * Chega pelo Menu → Informações (e por Conta → Sobre).
 */
export default function DesignSystemScreen() {
  const { navegar, simularSolicitacao } = useApp();
  const [exemplo, setExemplo] = useState(true);

  return (
    <Tela>
      <AppBar titulo="Design System" onVoltar={() => navegar('menu')} alturaTopo={TOPO_SEGURO} />

      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
        <Secao titulo="Superfícies e texto" />
        <View style={estilos.amostras}>
          <Amostra cor={cores.fundo} nome="fundo" borda />
          <Amostra cor={cores.superficie} nome="superfície" />
          <Amostra cor={cores.superficieAlta} nome="sup. alta" />
          <Amostra cor={claro.fundo} nome="claro" />
        </View>
        <View style={[estilos.amostras, { marginTop: 12 }]}>
          <Amostra cor={cores.acao} nome="ação" />
          <Amostra cor={cores.online} nome="online" />
          <Amostra cor={cores.alerta} nome="alerta" />
          <Amostra cor={cores.erro} nome="erro" />
        </View>

        <Secao titulo="Rampa de demanda" />
        <View style={estilos.rampa}>
          {PALETA_DEMANDA.map((faixa, nivel) => (
            <View key={nivel} style={estilos.linhaRampa}>
              <View
                style={[
                  estilos.corRampa,
                  {
                    backgroundColor: faixa.preenchimento,
                    borderColor: nivel === 0 ? cores.borda : faixa.borda,
                    borderStyle: nivel === 0 ? 'dashed' : 'solid',
                  },
                ]}
              />
              <Text style={estilos.textoRampa}>
                {nivel} · {FAIXAS[nivel]} · {faixa.rotulo.toLowerCase()}
                {faixa.eta ? ` · ${faixa.eta}` : ''}
              </Text>
            </View>
          ))}
        </View>

        <Secao titulo="Tipografia" />
        <View style={estilos.tipos}>
          <Text style={[tipo.display, { color: cores.texto }]}>R$ 9,72</Text>
          <Text style={[tipo.h1, { color: cores.texto }]}>Título h1</Text>
          <Text style={[tipo.h2, { color: cores.texto }]}>Seção h2</Text>
          <Text style={[tipo.h3, { color: cores.texto }]}>Linha h3</Text>
          <Text style={[tipo.corpo, { color: cores.textoSecundario }]}>
            Corpo 15/400 — texto descritivo em pt-BR.
          </Text>
          <Text style={[tipo.legenda, { color: cores.textoSecundario }]}>Legenda 13/500</Text>
          <Text style={[tipo.micro, { color: cores.textoTerciario }]}>MICRO 11/600</Text>
        </View>

        <Secao titulo="Componentes" />
        <View style={estilos.componentes}>
          <Botao titulo="Botão primário" onPress={() => {}} />
          <Botao titulo="Botão fantasma" variante="fantasma" onPress={() => {}} />

          <View style={estilos.chips}>
            <Chip texto="Chip informativo" escuro />
            <Chip texto="Verificado" icone="verified" tom="positivo" escuro />
            <Chip texto="+R$ 15" tom="bonus" escuro />
          </View>

          <View style={estilos.pills}>
            {[4, 3, 2].map((n) => (
              <View key={n} style={[estilos.pillEta, { backgroundColor: corSolida(n) }]}>
                <Text style={estilos.pillTexto}>↗ {PALETA_DEMANDA[n].eta}</Text>
              </View>
            ))}
          </View>

          <View style={estilos.linhaToggle}>
            <Alternador ligado={exemplo} onAlternar={() => setExemplo((v) => !v)} rotulo="Exemplo" />
            <Alternador ligado={!exemplo} onAlternar={() => setExemplo((v) => !v)} rotulo="Exemplo invertido" />
            <Text style={estilos.legenda}>Toggle on / off</Text>
          </View>
        </View>

        <Secao titulo="Ferramentas do protótipo" />
        <Text style={estilos.sobre}>
          No app real a solicitação chega do servidor. Aqui ela chega sozinha
          seis segundos depois de você ficar online — e este botão força a
          chegada agora, para você testar o fluxo sem esperar.
        </Text>
        <Botao
          titulo="Simular solicitação de corrida"
          variante="fantasma"
          onPress={simularSolicitacao}
          style={{ marginTop: 12 }}
        />

        <Secao titulo="Sobre este protótipo" />
        <Text style={estilos.sobre}>
          Clone didático em React Native + Expo. Toda a demanda, o preço dinâmico
          e os dados de corrida são simulados no aparelho — nada aqui vem de um
          servidor real. Nomes, endereços e valores são fictícios, e a interface
          não usa marca, logotipo ou nome de nenhum produto existente.
        </Text>
      </ScrollView>
    </Tela>
  );
}

/** Faixas de multiplicador de cada nível, para a legenda da rampa. */
const FAIXAS = ['<1,2x', '1,2–1,5x', '1,5–1,8x', '1,8–2,1x', '2,1–2,5x', '>2,5x'];

function Secao({ titulo }) {
  return <Text style={estilos.secao}>{titulo}</Text>;
}

function Amostra({ cor, nome, borda }) {
  return (
    <View style={estilos.amostra}>
      <View
        style={[
          estilos.amostraCor,
          { backgroundColor: cor },
          borda && { borderWidth: 1, borderColor: cores.borda },
        ]}
      />
      <Text style={estilos.amostraNome}>{nome}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  conteudo: { paddingHorizontal: espaco.md, paddingTop: 8, paddingBottom: 48 },

  secao: { ...tipo.secao, color: cores.textoTerciario, marginTop: 26, marginBottom: 10 },

  amostras: { flexDirection: 'row', gap: 8 },
  amostra: { flex: 1 },
  amostraCor: { height: 44, borderRadius: raio.sm },
  amostraNome: { fontSize: 10, fontFamily: familia.semi, color: cores.textoSecundario, marginTop: 5 },

  rampa: { gap: 6 },
  linhaRampa: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  corRampa: { width: 52, height: 28, borderRadius: 6, borderWidth: 1 },
  textoRampa: { ...tipo.micro, fontSize: 12, color: cores.textoSecundario, flex: 1 },

  tipos: { gap: 8 },

  componentes: { gap: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pillEta: { paddingHorizontal: 11, paddingVertical: 6, borderRadius: raio.redondo },
  pillTexto: { ...tipo.micro, color: '#FFFFFF' },
  linhaToggle: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  legenda: { ...tipo.micro, fontSize: 12, color: cores.textoSecundario },

  sobre: { ...tipo.corpo, color: cores.textoSecundario },
});
