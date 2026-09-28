import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Avatar from '../components/ui/Avatar';
import Icone from '../components/ui/Icone';
import Tela, { TOPO_SEGURO } from '../components/ui/Tela';
import { useApp } from '../estado/AppProvider';
import { linhasMenu, motorista } from '../data/mock';
import { cores, espaco } from '../theme/cores';
import { familia, tipo } from '../theme/tipografia';

/**
 * MENU (§5.3)
 * -----------
 * O bloco do perfil no topo é o item mais tocado da tela, então ele é grande,
 * tem avatar e é a ÚNICA linha com hierarquia visual. As outras são texto puro
 * de 52 px — deliberadamente monótonas.
 *
 * Isso é uma decisão de produto: numa lista de navegação, dar destaque a três
 * itens é o mesmo que não dar a nenhum. Escolha um e deixe o resto plano.
 */
export default function MenuScreen() {
  const { navegar, perfil, mostrarToast } = useApp();

  return (
    <Tela>
      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
        <Pressable
          onPress={() => navegar('perfil')}
          accessibilityRole="button"
          accessibilityLabel={`Perfil de ${perfil.nome}, nota 5,00`}
          style={({ pressed }) => [estilos.blocoPerfil, pressed && { opacity: 0.7 }]}
        >
          <View style={estilos.avatarArea}>
            <Avatar uri={perfil.foto} tamanho={56} />
            {/* Selo do nível Pro. Fica sobre o avatar em vez de virar mais uma
                linha da lista — status é identidade, não navegação. */}
            <View style={estilos.selo}>
              <Icone nome="diamond" tamanho={12} cor="#FFFFFF" />
            </View>
          </View>

          <View>
            <Text style={estilos.nome}>{perfil.nome}</Text>
            <View style={estilos.linhaNota}>
              <Icone nome="star" tamanho={15} cor={cores.texto} />
              <Text style={estilos.nota}>
                {motorista.nota.toFixed(2).replace('.', ',')}
              </Text>
            </View>
          </View>
        </Pressable>

        <View style={estilos.lista}>
          {linhasMenu.map((item, i) =>
            item.separador ? (
              <View key={`sep-${i}`} style={estilos.separador} />
            ) : (
              <Pressable
                key={item.label}
                onPress={() =>
                  item.destino ? navegar(item.destino) : mostrarToast(`${item.label}: em breve`)
                }
                accessibilityRole="button"
                style={({ pressed }) => [estilos.item, pressed && { backgroundColor: cores.superficie }]}
              >
                <Text style={estilos.itemTexto}>{item.label}</Text>
              </Pressable>
            )
          )}
        </View>
      </ScrollView>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  conteudo: { paddingTop: TOPO_SEGURO + 10, paddingBottom: 110 },

  blocoPerfil: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, paddingHorizontal: espaco.md },
  avatarArea: { width: 56, height: 56 },
  selo: {
    position: 'absolute', bottom: -2, right: -2, width: 22, height: 22, borderRadius: 11,
    backgroundColor: cores.acao, borderWidth: 2, borderColor: cores.fundo,
    alignItems: 'center', justifyContent: 'center',
  },
  nome: { ...tipo.h2, color: cores.texto },
  linhaNota: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  nota: { ...tipo.legenda, fontFamily: familia.semi, color: cores.texto, fontVariant: ['tabular-nums'] },

  lista: { marginTop: 14 },
  item: { height: 52, justifyContent: 'center', paddingHorizontal: espaco.md },
  itemTexto: { ...tipo.corpoForte, color: cores.texto },
  separador: { height: 1, backgroundColor: cores.borda, marginVertical: 10, marginHorizontal: espaco.md },
});
