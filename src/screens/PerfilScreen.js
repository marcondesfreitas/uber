import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Avatar from '../components/ui/Avatar';
import Botao from '../components/ui/Botao';
import Icone from '../components/ui/Icone';
import Tela, { TOPO_SEGURO } from '../components/ui/Tela';
import { useApp } from '../estado/AppProvider';
import { atributosPerfil } from '../data/mock';
import { cores, espaco } from '../theme/cores';
import { familia, tipo } from '../theme/tipografia';

/**
 * PERFIL PÚBLICO (§5.4)
 * ---------------------
 * É a única tela do mundo de gestão que foge do preto — e de propósito. O
 * halo laranja diz "isto aqui é VOCÊ, não é configuração". Um app inteiro
 * cinza-escuro precisa de um momento assim, senão tudo vira formulário.
 *
 * COMO O GRADIENTE É FEITO SEM DEPENDÊNCIA
 * ----------------------------------------
 * A especificação pede um `radial-gradient`. O React Native não tem gradiente
 * nativo — o caminho normal é `expo-linear-gradient`, que também não faz
 * radial. Em vez de instalar uma biblioteca por causa de um header, empilhamos
 * três elipses concêntricas com opacidade decrescente. De longe é
 * indistinguível de um gradiente radial, e é a mesma técnica que se usa para
 * "glow" atrás de qualquer elemento.
 *
 * O truque da elipse: `borderRadius` maior que metade da largura arredonda
 * tudo; combinado com largura ≠ altura, o círculo vira oval.
 */
export default function PerfilScreen() {
  const { navegar, perfil, mostrarToast } = useApp();

  return (
    <Tela>
      {/* A barra fica FORA do gradiente e por cima dele: no vídeo o título
          "Perfil" e o lápis flutuam sobre o laranja, sem faixa própria. */}
      <View style={estilos.barra}>
        <BotaoBarra icone="arrow_back" rotulo="Voltar" onPress={() => navegar('menu')} />
        <Text style={estilos.tituloBarra}>Perfil</Text>
        <BotaoBarra icone="edit" rotulo="Editar perfil" onPress={() => navegar('editarPerfil')} />
      </View>

      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
        <View style={estilos.header}>
          {/* Camadas do "gradiente": da mais larga e escura para a mais
              estreita e clara. A ordem importa — a última desenha por cima. */}
          <View style={[estilos.halo, estilos.haloExterno]} />
          <View style={[estilos.halo, estilos.haloMedio]} />
          <View style={[estilos.halo, estilos.haloInterno]} />

          <View style={estilos.identidade}>
            {/* A máscara "orgânica" do avatar: quatro raios diferentes fazem
                uma forma de seixo em vez de um círculo. Detalhe pequeno que
                muda a temperatura da tela inteira.

                A foto vem de Menu → Perfil → ✎ → "Escolher foto". Sem foto, o
                Avatar desenha o ícone sobre o bege — que é um estado legítimo,
                não um buraco. */}
            <Avatar
              uri={perfil.foto}
              tamanho={120}
              forma="organica"
              style={estilos.avatar}
            />

            <Text style={estilos.nome}>{perfil.nome}</Text>

            <Botao
              titulo="Saiba mais sobre Uber Pro"
              variante="claro"
              corTexto={cores.acao}
              onPress={() => mostrarToast('Uber Pro: em breve')}
              style={estilos.botaoPro}
            />
          </View>
        </View>

        <View style={estilos.atributos}>
          {atributosPerfil.map((a) => (
            <View key={a.texto} style={estilos.atributo}>
              <Icone nome={a.icone} tamanho={20} cor={cores.textoSecundario} />
              <Text style={estilos.atributoTexto}>{a.texto}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </Tela>
  );
}

function BotaoBarra({ icone, rotulo, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      hitSlop={10}
      style={({ pressed }) => [estilos.botaoBarra, pressed && { opacity: 0.55 }]}
    >
      <Icone nome={icone} tamanho={22} cor="#FFFFFF" />
    </Pressable>
  );
}

const HEADER = 400;

const estilos = StyleSheet.create({
  barra: {
    position: 'absolute', top: TOPO_SEGURO, left: 0, right: 0, zIndex: 5,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12,
  },
  botaoBarra: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  tituloBarra: { ...tipo.h3, color: '#FFFFFF', flex: 1, textAlign: 'center' },

  conteudo: { paddingBottom: 110 },

  header: { height: HEADER, overflow: 'hidden' },
  halo: { position: 'absolute', alignSelf: 'center' },
  haloExterno: { top: -200, width: 900, height: 660, borderRadius: 450, backgroundColor: '#8A4B0F' },
  haloMedio: { top: -160, width: 620, height: 480, borderRadius: 310, backgroundColor: '#B4661A' },
  haloInterno: { top: -130, width: 380, height: 330, borderRadius: 190, backgroundColor: '#F5A524' },

  identidade: { position: 'absolute', top: 128, left: 0, right: 0, alignItems: 'center' },
  // Tamanho e máscara vêm do próprio Avatar; aqui fica só a cor de fundo do
  // estado sem foto, que é específica desta tela (bege, não cinza).
  avatar: { backgroundColor: '#F7E7CE' },
  nome: { ...tipo.h1, fontSize: 22, color: cores.texto, marginTop: 16 },
  botaoPro: { marginTop: 20, height: 52, paddingHorizontal: 26 },

  // A lista de atributos fica separada do header por uma linha fina — no
  // vídeo é ela que marca onde o "cartão de visita" acaba e os fatos começam.
  atributos: {
    paddingHorizontal: espaco.md,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
    paddingTop: 4,
  },
  atributo: { flexDirection: 'row', alignItems: 'center', gap: 14, height: 52 },
  atributoTexto: { ...tipo.corpo, color: cores.texto },
});
