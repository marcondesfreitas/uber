import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import SheetBase from './SheetBase';
import Chip from '../ui/Chip';
import Icone from '../ui/Icone';
import { corridaExemplo } from '../../data/mock';
import { claro, cores } from '../../theme/cores';
import { brl, familia, tipo } from '../../theme/tipografia';

/**
 * SOLICITAÇÃO DE CORRIDA (§5.13) — o momento de maior tensão da UI
 * ================================================================
 *
 * O motorista tem 12 segundos, está dirigindo, e precisa decidir. Cada escolha
 * abaixo existe por causa dessa frase.
 *
 * 1) O CARTÃO INTEIRO É O BOTÃO "ACEITAR".
 *    Um alvo de 300×400 px acerta com o polegar sem olhar. Um botão de 52 px
 *    exige mirar — e mirar exige olhar para a tela, num carro em movimento.
 *    O X de recusar é pequeno E fica no canto: recusar deve ser deliberado.
 *
 * 2) A HIERARQUIA É O VALOR.
 *    R$ 9,72 em 34/800 é a primeira coisa que o olho encontra, antes até do
 *    tipo de serviço. O R$/km logo abaixo é o número que separa uma boa
 *    corrida de uma armadilha (valor alto com 40 km de deslocamento).
 *
 * 3) A CONTAGEM É UMA BARRA, NÃO UM NÚMERO.
 *    "8… 7… 6…" obriga a ler. Uma barra encolhendo é lida na periferia da
 *    visão. Ela fica VERMELHA nos últimos 3 s (§6.4) — mas o vermelho não é o
 *    único aviso: a barra já está visivelmente curta.
 *
 * 4) A TIMELINE retirada → destino usa a metáfora do ponto e do quadrado, a
 *    mesma de qualquer app de mapas. Círculo = de onde, quadrado = para onde.
 */
export default function SheetSolicitacao({ contagem, total, onAceitar, onRecusar }) {
  const restante = Math.max(0, contagem);
  const proporcao = restante / total;
  const urgente = restante <= 3;
  const c = corridaExemplo;

  return (
    <SheetBase>
      {/* Barra de contagem regressiva, colada no topo do sheet. */}
      <View
        style={estilos.trilho}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: total, now: Math.ceil(restante) }}
        accessibilityLabel={`${Math.ceil(restante)} segundos para decidir`}
      >
        <View
          style={[
            estilos.progresso,
            { width: `${proporcao * 100}%`, backgroundColor: urgente ? cores.erro : cores.acao },
          ]}
        />
      </View>

      <Pressable
        onPress={onAceitar}
        accessibilityRole="button"
        accessibilityLabel={
          `Aceitar viagem ${c.servico} por ${brl(c.valor)}. ` +
          `Retirada a ${c.retirada.eta}, ${c.retirada.endereco}. ` +
          `Destino ${c.destino.endereco}.`
        }
        style={({ pressed }) => [estilos.cartao, pressed && { backgroundColor: '#FAFAFC' }]}
      >
        <View style={estilos.linhaTopo}>
          <Chip texto={c.servico} icone="inventory_2" />
          {/* Espaço reservado para o X, que é desenhado FORA deste cartão
              (veja abaixo) — sem isto o chip esticaria por baixo dele. */}
          <View style={estilos.vagaRecusar} />
        </View>

        <Text style={estilos.valor}>{brl(c.valor)}</Text>
        <Text style={estilos.porKm}>{brl(c.porKm)}/km aprox.</Text>

        <View style={estilos.chips}>
          <Chip
            texto={`${c.passageiro.nota.toFixed(2).replace('.', ',')} (${c.passageiro.avaliacoes})`}
            icone="star"
          />
          {c.passageiro.verificado ? <Chip texto="Verificado" icone="verified" tom="positivo" /> : null}
          <Chip texto={`+${brl(c.bonus)} incluído`} icone="bolt" tom="bonus" />
        </View>

        <View style={estilos.timeline}>
          <View style={estilos.trilha}>
            <View style={estilos.pontoOrigem} />
            <View style={estilos.linhaTrilha} />
            <View style={estilos.pontoDestino} />
          </View>

          <View style={estilos.paradas}>
            <View>
              <Text style={estilos.parada}>{`${c.retirada.eta} (${c.retirada.dist})`}</Text>
              <Text style={estilos.endereco}>{c.retirada.endereco}</Text>
            </View>
            <View>
              <Text style={estilos.parada}>{`${c.destino.eta} (${c.destino.dist})`}</Text>
              <Text style={estilos.endereco}>{c.destino.endereco}</Text>
            </View>
          </View>
        </View>

        <Text style={estilos.dica}>Toque no cartão para aceitar</Text>
      </Pressable>

      {/*
        POR QUE O X NÃO MORA DENTRO DO CARTÃO
        -------------------------------------
        O cartão inteiro é o botão "aceitar". Aninhar o botão de recusar dentro
        dele cria um botão dentro de outro botão — e isso é problema em duas
        frentes:

          • na web vira HTML inválido (<button> dentro de <button>), o que o
            React avisa e alguns navegadores "consertam" sozinhos, movendo os
            elementos de lugar;
          • para leitor de tela, o alvo interno fica ambíguo: a pessoa ouve dois
            botões sobrepostos sem saber qual está prestes a acionar.

        Deixando-o como IRMÃO posicionado por cima, os dois alvos são
        independentes — e recusar nunca dispara aceitar por propagação.
      */}
      <Pressable
        onPress={onRecusar}
        accessibilityRole="button"
        accessibilityLabel="Recusar viagem"
        hitSlop={10}
        style={({ pressed }) => [estilos.recusar, pressed && { opacity: 0.6 }]}
      >
        <Icone nome="close" tamanho={20} cor={claro.texto} />
      </Pressable>
    </SheetBase>
  );
}

const estilos = StyleSheet.create({
  trilho: { height: 5, backgroundColor: claro.borda },
  progresso: { height: 5 },

  cartao: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 12 },

  linhaTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  vagaRecusar: { width: 38, height: 38 },
  recusar: {
    // 5 px da barra de contagem + 18 px de padding do cartão = alinhado com o
    // chip do serviço, exatamente onde estava antes de sair de dentro dele.
    position: 'absolute', top: 21, right: 18,
    width: 38, height: 38, borderRadius: 12, backgroundColor: claro.superficieAlta,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 2,
  },

  valor: { ...tipo.display, color: claro.texto, marginTop: 12, fontVariant: ['tabular-nums'] },
  porKm: { ...tipo.legenda, color: claro.textoSecundario, marginTop: 2 },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },

  timeline: { flexDirection: 'row', gap: 12, marginTop: 18 },
  trilha: { alignItems: 'center', paddingTop: 6 },
  pontoOrigem: { width: 9, height: 9, borderRadius: 5, backgroundColor: claro.texto },
  linhaTrilha: { width: 2, flex: 1, minHeight: 34, backgroundColor: '#D8D8DE', marginVertical: 4 },
  pontoDestino: { width: 9, height: 9, backgroundColor: claro.texto },
  paradas: { flex: 1, gap: 16 },
  parada: { ...tipo.corpoForte, fontFamily: familia.bold, color: claro.texto },
  endereco: { ...tipo.legenda, color: claro.textoSecundario, marginTop: 2 },

  dica: { ...tipo.legenda, fontFamily: familia.semi, color: claro.textoSecundario, textAlign: 'center', paddingVertical: 18 },
});
