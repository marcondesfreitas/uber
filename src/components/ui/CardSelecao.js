import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Icone from './Icone';
import Pressionavel from './Pressionavel';
import { cores, raio } from '../../theme/cores';
import { familia, tipo } from '../../theme/tipografia';

/**
 * CARD DE SELEÇÃO (§3 `SelectCard`)
 * ---------------------------------
 * Card alto com ícone grande, título e um indicador no canto superior direito.
 * Usado em dois lugares com semânticas DIFERENTES — e é por isso que ele
 * recebe a prop `forma`:
 *
 *   forma="radio"    Gerenciar veículos → escolha ÚNICA (carro OU moto)
 *   forma="checkbox" Preferências       → escolha MÚLTIPLA (aceito A, B e D)
 *
 * Rádio é redondo, checkbox é quadrado. Isso não é convenção decorativa:
 * é como o usuário descobre, antes de tocar, se ao escolher esta opção ele
 * vai PERDER a anterior. Trocar as formas quebra essa expectativa silenciosamente.
 */
export default function CardSelecao({ nome, icone, imagem, descricao, selecionado, onPress, forma = 'radio', badge }) {
  return (
    <Pressionavel
      onPress={onPress}
      // Card de grade SEMPRE ocupa a fatia inteira da coluna. Fica aqui, e não
      // em cada tela que monta uma grade, porque é característica do card —
      // não da grade. Ver a explicação da prop em `Pressionavel`.
      preencher
      accessibilityRole={forma === 'radio' ? 'radio' : 'checkbox'}
      accessibilityState={{ checked: selecionado }}
      accessibilityLabel={descricao ? `${nome}. ${descricao}` : nome}
      style={[
        estilos.card,
        imagem && estilos.cardComImagem,
        { borderColor: selecionado ? cores.texto : cores.borda },
      ]}
    >
      {badge ? (
        <View style={estilos.badge}>
          <Text style={estilos.badgeTexto}>↗ {badge}</Text>
        </View>
      ) : null}

      <View
        style={[
          estilos.indicador,
          forma === 'radio' ? estilos.redondo : estilos.quadrado,
          {
            borderColor: selecionado ? cores.texto : cores.textoTerciario,
            backgroundColor: selecionado ? cores.texto : 'transparent',
          },
        ]}
      >
        {/* O "miolo" recortado: um quadrado da cor do card por dentro do
            indicador preenchido. Mais barato que renderizar um ✓ e funciona
            igual para rádio e checkbox. */}
        {selecionado ? <View style={[estilos.miolo, forma === 'radio' && { borderRadius: 6 }]} /> : null}
      </View>

      {/* Imagem quando existir, ícone quando não. Não é fallback defensivo: os
          cards de veículo mostram o veículo, e os de tipo de serviço mostram um
          pictograma. São dois vocabulários visuais no mesmo componente. */}
      {imagem ? (
        <Image
          source={imagem}
          // `contain` e não `cover`: recortar um carro pela metade para
          // preencher a caixa é pior do que sobrar espaço em volta dele.
          resizeMode="contain"
          style={estilos.imagem}
          accessibilityRole="image"
          accessibilityLabel=""
        />
      ) : (
        <Icone nome={icone} tamanho={30} cor={cores.texto} />
      )}

      <Text style={[estilos.nome, imagem && estilos.nomeSobImagem]}>{nome}</Text>
      {descricao ? <Text style={estilos.desc}>{descricao}</Text> : null}
    </Pressionavel>
  );
}

const estilos = StyleSheet.create({
  card: {
    // Sem `flex: 1` aqui de propósito. Quem estica o card para a fatia inteira
    // é o `preencher` do Pressionavel, na camada de fora. Um `flex: 1` nesta
    // camada colocava a altura sob controle do flex (base 0 + crescer) e
    // ANULAVA o `height` abaixo — os cards saíam com 94 px em vez de 132.
    alignSelf: 'stretch',
    height: 132,
    borderRadius: raio.md,
    borderWidth: 1.5,
    backgroundColor: cores.superficie,
    padding: 14,
    justifyContent: 'flex-end',
    gap: 3,
  },
  /**
   * O card com imagem é mais alto e o conteúdo passa a ser centralizado.
   *
   * Com ícone, tudo fica ancorado embaixo (`justifyContent: flex-end`) porque
   * um pictograma de 30 px flutuando no meio de um card grande parece perdido.
   * Uma imagem de veículo é o contrário: ela É o conteúdo, precisa de espaço,
   * e fica melhor no centro com o rótulo por baixo.
   */
  cardComImagem: { height: 150, justifyContent: 'center', alignItems: 'center', paddingTop: 18 },
  imagem: { width: '100%', flex: 1 },
  nomeSobImagem: { marginTop: 6, textAlign: 'center' },

  indicador: { position: 'absolute', top: 12, right: 12, width: 20, height: 20, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  redondo: { borderRadius: 10 },
  quadrado: { borderRadius: 6 },
  miolo: { width: 10, height: 10, borderRadius: 2, backgroundColor: cores.superficie },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    height: 22,
    paddingHorizontal: 8,
    borderRadius: 11,
    backgroundColor: 'rgba(31,214,95,0.16)',
    justifyContent: 'center',
  },
  badgeTexto: { fontSize: 10, fontFamily: familia.bold, color: cores.online },
  nome: { ...tipo.corpoForte, fontFamily: familia.bold, color: cores.texto, marginTop: 10 },
  desc: { ...tipo.micro, fontFamily: familia.media, color: cores.textoSecundario },
});
