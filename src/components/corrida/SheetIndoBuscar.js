import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import SheetBase from './SheetBase';
import Botao from '../ui/Botao';
import Icone from '../ui/Icone';
import Pressionavel from '../ui/Pressionavel';
import { corridaExemplo } from '../../data/mock';
import { claro } from '../../theme/cores';
import { brl, familia, tipo } from '../../theme/tipografia';

/**
 * INDO BUSCAR (§5.14)
 * -------------------
 * A tensão acabou: a corrida é sua. Agora a tela vira ferramenta de execução.
 *
 * As três ações — Navegar, Mensagem, Ligar — ficam lado a lado e do MESMO
 * tamanho porque não existe uma "principal": depende de o passageiro estar na
 * calçada, atrasado ou no prédio errado. Quando as opções são igualmente
 * prováveis, hierarquizá-las só faz a pessoa procurar mais.
 *
 * "Cancelar viagem" é texto puro, vermelho, no rodapé. Ação destrutiva não
 * merece um botão bonito ao lado do CTA — merece estar acessível e ser
 * visivelmente diferente de tudo o que se toca por engano.
 */
export default function SheetIndoBuscar({ onCheguei, onCancelar, onAcao }) {
  const c = corridaExemplo;

  return (
    <SheetBase style={estilos.sheet}>
      <View style={estilos.topo}>
        <View style={estilos.avatar}>
          <Icone nome="person" tamanho={24} cor={claro.textoSecundario} />
        </View>

        <View style={estilos.identidade}>
          <Text style={estilos.nome}>{c.passageiro.nome}</Text>
          <Text style={estilos.detalhe}>
            {`★ ${c.passageiro.nota.toFixed(2).replace('.', ',')} · ${c.retirada.eta} (${c.retirada.dist}) até a retirada`}
          </Text>
        </View>

        <Text style={estilos.valor}>{brl(c.valor)}</Text>
      </View>

      <Text style={estilos.endereco}>{c.retirada.curto}</Text>

      <View style={estilos.acoes}>
        <AcaoRapida icone="navigation" rotulo="Navegar" onPress={() => onAcao('Abrindo a navegação…')} />
        <AcaoRapida icone="chat_bubble" rotulo="Mensagem" onPress={() => onAcao('Chat com o passageiro: em breve')} />
        <AcaoRapida icone="call" rotulo="Ligar" onPress={() => onAcao('Ligação mascarada: em breve')} />
      </View>

      <Botao titulo="Cheguei ao local" onPress={onCheguei} style={{ marginTop: 12 }} />
      <Botao
        titulo="Cancelar viagem"
        variante="texto"
        destrutivo
        onPress={onCancelar}
        style={estilos.cancelar}
      />
    </SheetBase>
  );
}

function AcaoRapida({ icone, rotulo, onPress }) {
  return (
    <Pressionavel onPress={onPress} accessibilityLabel={rotulo} style={estilos.acao}>
      <View style={estilos.acaoConteudo}>
        <Icone nome={icone} tamanho={20} cor={claro.texto} />
        <Text style={estilos.acaoTexto}>{rotulo}</Text>
      </View>
    </Pressionavel>
  );
}

const estilos = StyleSheet.create({
  sheet: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 26 },

  topo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#E3E3E8',
    alignItems: 'center', justifyContent: 'center',
  },
  identidade: { flex: 1, minWidth: 0 },
  nome: { ...tipo.h3, color: claro.texto },
  detalhe: { ...tipo.legenda, color: claro.textoSecundario, marginTop: 2 },
  valor: { ...tipo.h2, fontFamily: familia.extra, color: claro.texto, fontVariant: ['tabular-nums'] },

  endereco: {
    ...tipo.legenda, color: claro.textoSecundario, marginTop: 14,
    padding: 12, borderRadius: 10, backgroundColor: claro.fundo,
  },

  acoes: { flexDirection: 'row', gap: 8, marginTop: 14 },
  acao: { flex: 1, height: 48, borderRadius: 12, backgroundColor: claro.superficieAlta, alignItems: 'center', justifyContent: 'center' },
  acaoConteudo: { alignItems: 'center', gap: 2 },
  acaoTexto: { ...tipo.micro, color: claro.texto },

  cancelar: { height: 44, marginTop: 8 },
});
