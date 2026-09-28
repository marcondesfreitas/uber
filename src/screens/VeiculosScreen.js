import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AppBar from '../components/ui/AppBar';
import Botao from '../components/ui/Botao';
import Icone from '../components/ui/Icone';
import Tela, { TOPO_SEGURO } from '../components/ui/Tela';
import { useApp } from '../estado/AppProvider';
import { ilustracoesVeiculo } from '../data/mock';
import { cores, espaco, raio } from '../theme/cores';
import { familia, tipo } from '../theme/tipografia';

/**
 * VEÍCULOS — o veículo ativo hoje
 * -------------------------------
 * Primeira etapa do fluxo de veículos, e a que faltava no protótipo: ela só
 * MOSTRA qual veículo está em uso. Trocar acontece na tela seguinte
 * (`GerenciarVeiculosScreen`).
 *
 * POR QUE DUAS TELAS PARA UMA COISA SÓ
 * ------------------------------------
 * Porque as duas perguntas têm frequências muito diferentes. "Qual é o meu
 * veículo ativo?" é consultado toda semana; "quero trocar de veículo"
 * acontece talvez duas vezes por ano. Juntar as duas numa tela só faria a
 * consulta rápida carregar o peso de um formulário — e formulário aberto por
 * engano é como se apaga uma placa sem querer.
 *
 * O card verde no rodapé é publicidade interna (aluguel e compra de veículos).
 * Ele fica DEPOIS da ação principal, e é o único elemento colorido da tela:
 * visível para quem procura, fácil de ignorar para quem não.
 */
export default function VeiculosScreen() {
  const { navegar, veiculo, mostrarToast } = useApp();

  const ehMoto = veiculo.tipo === 'moto';

  return (
    <Tela>
      <AppBar titulo="Veículos" onVoltar={() => navegar('conta')} alturaTopo={TOPO_SEGURO} />

      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
        {/* A ilustração é do TIPO de veículo, não do modelo exato: o app real
            tem um render por modelo, e manter isso num protótipo significaria
            uma imagem nova a cada carro cadastrado. Carro ou moto é a
            distinção que muda o que aparece no resto da tela. */}
        <View style={estilos.ilustracao}>
          <Image
            source={ilustracoesVeiculo[ehMoto ? 'moto' : 'carro']}
            resizeMode="contain"
            style={estilos.ilustracaoImagem}
            accessibilityRole="image"
            accessibilityLabel={ehMoto ? 'Ilustração de uma moto' : 'Ilustração de um carro'}
          />
        </View>

        <View style={estilos.identificacao}>
          <View style={{ flex: 1 }}>
            <Text style={estilos.modelo}>{veiculo.modelo}</Text>
            <Text style={estilos.placa}>{veiculo.placa}</Text>
          </View>

          <Pressable
            onPress={() => mostrarToast('Opções do veículo: em breve')}
            accessibilityRole="button"
            accessibilityLabel="Mais opções do veículo"
            hitSlop={8}
            style={({ pressed }) => [estilos.maisOpcoes, pressed && { opacity: 0.7 }]}
          >
            <Icone nome="more_vert" tamanho={20} cor={cores.texto} />
          </Pressable>
        </View>

        <Botao
          titulo="Gerenciar veículos"
          variante="fantasma"
          onPress={() => navegar('gerenciarVeiculos')}
          style={estilos.botao}
        />

        <View style={estilos.promo}>
          <Text style={estilos.promoTitulo}>Descubra oportunidades de veículos</Text>
          <Text style={estilos.promoTexto}>
            Veja as opções de veículos de parceiro locador, aluguel ou compra de
            veículos se precisar de outro veículo.
          </Text>

          <Pressable
            onPress={() => mostrarToast('Oportunidades de veículos: em breve')}
            accessibilityRole="link"
            accessibilityLabel="Saiba mais sobre oportunidades de veículos"
            style={({ pressed }) => [estilos.promoLink, pressed && { opacity: 0.7 }]}
          >
            <Text style={estilos.promoLinkTexto}>Saiba mais</Text>
            <Icone nome="arrow_forward" tamanho={18} cor="#FFFFFF" />
          </Pressable>
        </View>
      </ScrollView>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  conteudo: { paddingHorizontal: espaco.md, paddingBottom: 110 },

  ilustracao: { height: 160, alignItems: 'center', justifyContent: 'center' },
  // Largura cheia com `contain`: a moto é retrato e o carro é paisagem, então
  // deixar a caixa mandar na altura é o que faz as duas ocuparem o mesmo
  // espaço vertical em vez de uma parecer maior que a outra.
  ilustracaoImagem: { width: '100%', height: '100%' },

  identificacao: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginTop: 8 },
  modelo: { ...tipo.h2, fontFamily: familia.extra, color: cores.texto },
  placa: { ...tipo.legenda, color: cores.textoSecundario, marginTop: 4, letterSpacing: 0.5 },
  maisOpcoes: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: cores.superficieAlta,
    alignItems: 'center', justifyContent: 'center',
  },

  botao: { marginTop: 24, borderRadius: raio.sm },

  // O verde-petróleo é o único aqui que não vem da paleta de estado do app —
  // ele marca "conteúdo comercial", não "situação da corrida". Misturar os dois
  // faria um anúncio parecer um alerta operacional.
  promo: { marginTop: 24, padding: 20, borderRadius: raio.md, backgroundColor: '#0E7C7B' },
  promoTitulo: { ...tipo.h3, color: '#FFFFFF' },
  promoTexto: { ...tipo.corpo, color: 'rgba(255,255,255,0.88)', marginTop: 8 },
  promoLink: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18 },
  promoLinkTexto: { ...tipo.corpoForte, fontFamily: familia.bold, color: '#FFFFFF' },
});
