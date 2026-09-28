import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AppBar from '../components/ui/AppBar';
import Avatar from '../components/ui/Avatar';
import Icone from '../components/ui/Icone';
import Tela, { TOPO_SEGURO } from '../components/ui/Tela';
import { useApp } from '../estado/AppProvider';
import { cores, espaco, raio } from '../theme/cores';
import { tipo } from '../theme/tipografia';

const TABS = ['Página inicial', 'Dados pessoais', 'Segurança', 'Privacidade e dados'];

/** Os três atalhos da aba inicial — os mesmos nomes das outras abas. */
const ATALHOS = [
  { label: 'Dados pessoais', icone: 'person' },
  { label: 'Segurança', icone: 'lock' },
  { label: 'Privacidade e dados', icone: 'lock' },
];

/**
 * CONTA DA UBER (§5.7)
 * --------------------
 * Modal de tela cheia com abas roláveis.
 *
 * POR QUE MODAL E NÃO MAIS UMA TELA DA PILHA
 * ------------------------------------------
 * Isto é a "conta" no sentido de identidade — o mesmo cadastro que vale para
 * outros produtos da empresa. Apresentar como camada por cima (com X, não com
 * seta) comunica "você saiu do app do motorista e entrou noutro contexto".
 * É a mesma convenção do login federado. Trocar o X por uma seta apagaria essa
 * fronteira, e o usuário não entenderia por que o visual mudou.
 *
 * A ABA INICIAL É UM ÍNDICE, NÃO CONTEÚDO
 * ---------------------------------------
 * Ela mostra quem você é (foto, nome, e-mail) e três cards que levam às outras
 * abas — que são as MESMAS abas da faixa de cima. Isso parece redundante e não
 * é: a faixa horizontal rola e corta o último item, então quem chega pela
 * primeira vez pode nem perceber que "Privacidade e dados" existe. Os cards
 * garantem que as três áreas apareçam inteiras pelo menos uma vez.
 */
export default function ContaDadosScreen() {
  const { navegar, perfil, tabConta, setTabConta, mostrarToast } = useApp();

  const dados = [
    { titulo: 'Nome', valor: perfil.nome, verificado: false, acao: 'chevron_right' },
    { titulo: 'Gênero', valor: perfil.genero, verificado: false, acao: 'chevron_right' },
    { titulo: 'Número de telefone', valor: perfil.telefone, verificado: true, acao: 'chevron_right' },
    { titulo: 'E-mail', valor: perfil.email, verificado: true, acao: 'chevron_right' },
    { titulo: 'Idioma', valor: perfil.idioma, verificado: false, acao: 'open_in_new' },
  ];

  return (
    <Tela>
      <AppBar
        titulo="Conta da Uber"
        variante="modal"
        onVoltar={() => navegar('conta')}
        alturaTopo={TOPO_SEGURO}
      />

      <View style={estilos.abas}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.abasConteudo}>
          {TABS.map((t) => {
            const ativa = tabConta === t;
            return (
              <Pressable
                key={t}
                onPress={() => setTabConta(t)}
                accessibilityRole="tab"
                accessibilityState={{ selected: ativa }}
                style={[estilos.aba, ativa && estilos.abaAtiva]}
              >
                <Text style={[estilos.abaTexto, ativa && estilos.abaTextoAtivo]}>{t}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
        {tabConta === 'Página inicial' ? (
          <>
            <View style={estilos.identidade}>
              <Avatar uri={perfil.foto} tamanho={80} />
              <Text style={estilos.nome}>{perfil.nome}</Text>
              <Text style={estilos.email}>{perfil.email}</Text>
            </View>

            <View style={estilos.atalhos}>
              {ATALHOS.map((a) => (
                <Pressable
                  key={a.label}
                  onPress={() => setTabConta(a.label)}
                  accessibilityRole="button"
                  accessibilityLabel={`Abrir ${a.label}`}
                  style={({ pressed }) => [estilos.atalho, pressed && { opacity: 0.7 }]}
                >
                  <Icone nome={a.icone} tamanho={24} cor={cores.texto} />
                  <Text style={estilos.atalhoTexto}>{a.label}</Text>
                </Pressable>
              ))}
            </View>
          </>
        ) : null}

        {tabConta === 'Dados pessoais' ? (
          <>
            <View style={estilos.avatarSolto}>
              <Avatar uri={perfil.foto} tamanho={80} />
            </View>

            <View style={estilos.lista}>
              {dados.map((d) => (
                <Pressable
                  key={d.titulo}
                  onPress={() => mostrarToast(`Editar ${d.titulo.toLowerCase()}: em breve`)}
                  accessibilityRole="button"
                  accessibilityLabel={
                    `${d.titulo}: ${d.valor}${d.verificado ? '. Verificado' : ''}`
                  }
                  style={({ pressed }) => [estilos.linha, pressed && { backgroundColor: cores.superficie }]}
                >
                  <View style={estilos.meio}>
                    <Text style={estilos.rotulo}>{d.titulo}</Text>
                    <Text style={estilos.valor}>{d.valor}</Text>
                  </View>

                  {/* O selo ✅ não é enfeite: ele diz quais dados já servem
                      para recuperar a conta se você perder o acesso. */}
                  {d.verificado ? (
                    <View style={estilos.selo}>
                      <Icone nome="check" tamanho={13} cor={cores.fundo} />
                    </View>
                  ) : null}

                  <Icone nome={d.acao} tamanho={20} cor={cores.textoTerciario} />
                </Pressable>
              ))}
            </View>
          </>
        ) : null}

        {tabConta === 'Segurança' || tabConta === 'Privacidade e dados' ? (
          // Estado vazio honesto. Uma aba que abre em branco parece bug;
          // uma aba que diz o que vai ter ali parece roadmap.
          <View style={estilos.vazio}>
            <Icone nome="lock" tamanho={28} cor={cores.textoTerciario} />
            <Text style={estilos.vazioTexto}>
              “{tabConta}” faz parte do Módulo 5 (polimento e privacidade).
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  abas: { borderBottomWidth: 1, borderBottomColor: cores.borda },
  abasConteudo: { paddingHorizontal: espaco.md, gap: 22 },
  aba: { paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  abaTexto: { ...tipo.legenda, fontSize: 14, color: cores.textoTerciario },
  abaTextoAtivo: { color: cores.texto },
  abaAtiva: { borderBottomColor: cores.texto },

  conteudo: { paddingTop: 24, paddingBottom: 110 },

  identidade: { alignItems: 'center', paddingHorizontal: espaco.md },
  avatarSolto: { alignItems: 'center' },
  nome: { ...tipo.h2, color: cores.texto, marginTop: 12 },
  email: { ...tipo.legenda, color: cores.textoSecundario, marginTop: 2 },

  atalhos: { flexDirection: 'row', gap: 10, paddingHorizontal: espaco.md, marginTop: 22 },
  atalho: {
    flex: 1, height: 96, borderRadius: raio.md, backgroundColor: cores.superficie,
    alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 8,
  },
  atalhoTexto: { ...tipo.legenda, color: cores.texto, textAlign: 'center' },

  lista: { marginTop: 22 },
  linha: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 14, paddingHorizontal: espaco.md,
    borderTopWidth: 1, borderTopColor: cores.superficie,
  },
  meio: { flex: 1, minWidth: 0 },
  rotulo: { ...tipo.legenda, color: cores.textoSecundario },
  valor: { ...tipo.corpoForte, color: cores.texto, marginTop: 3 },
  selo: {
    width: 18, height: 18, borderRadius: 9, backgroundColor: cores.online,
    alignItems: 'center', justifyContent: 'center',
  },

  vazio: { alignItems: 'center', gap: 12, paddingHorizontal: 40, paddingTop: 48 },
  vazioTexto: { ...tipo.corpo, color: cores.textoSecundario, textAlign: 'center' },
});
