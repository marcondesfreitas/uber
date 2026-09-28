import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Botao from '../components/ui/Botao';
import Icone from '../components/ui/Icone';
import Tela, { TOPO_SEGURO } from '../components/ui/Tela';
import { useApp } from '../estado/AppProvider';
import * as haptica from '../estado/haptica';
import { claro, espaco, raio } from '../theme/cores';
import { familia, tipo } from '../theme/tipografia';

const MARCA = require('../../assets/marca.png');

/**
 * ATIVAÇÃO — a porta de entrada do app
 * ====================================
 * Aparece uma vez, entre a splash e a Início. Depois de ativado, o app abre
 * direto — que é exatamente o que o aviso amarelo promete ao usuário.
 *
 * ELA É CLARA NUM APP ESCURO, E ISSO É PROPOSITAL
 * ----------------------------------------------
 * O app inteiro é quase preto; esta tela é branca. A troca marca que aqui é
 * outro momento: não é o produto ainda, é a portaria. É o mesmo recurso que a
 * tela "Ficando online…" usa — mundo claro para o que é operacional, mundo
 * escuro para o produto.
 *
 * QUEM VALIDA O TOKEN É O PROVIDER, NÃO ESTA TELA
 * -----------------------------------------------
 * `ativar()` devolve `true` ou `false`. A tela não sabe qual é o token certo,
 * e é assim que deve ser: no dia em que a conferência virar uma chamada de
 * rede, o que muda é o provider — esta tela continua igual, só passando a
 * esperar a resposta.
 *
 * O ERRO APARECE NO CAMPO, NÃO NUM ALERTA
 * ---------------------------------------
 * Mensagem embaixo do input e borda vermelha: o problema fica ao lado da coisa
 * que precisa ser corrigida, e some assim que o usuário volta a digitar. Um
 * alerta obrigaria a fechá-lo antes de tentar de novo, e levaria o texto do
 * erro embora junto.
 */
export default function AtivacaoScreen() {
  const { ativar } = useApp();
  const [token, setToken] = useState('');
  const [erro, setErro] = useState(null);

  const limpo = token.trim();

  function digitar(texto) {
    setToken(texto);
    // O erro morre no primeiro toque de tecla: mantê-lo enquanto a pessoa
    // conserta é acusá-la de algo que ela já está resolvendo.
    if (erro) setErro(null);
  }

  function confirmar() {
    if (!limpo) return;

    if (!ativar(limpo)) {
      haptica.alertar();
      setErro('Token inválido. Confira e tente de novo.');
    }
  }

  return (
    <Tela tema="claro">
      {/* ScrollView e não View: com o teclado aberto num iPhone pequeno, o
          botão fica embaixo dele. Rolar é a saída, e sai de graça aqui. */}
      <ScrollView
        contentContainerStyle={estilos.conteudo}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={estilos.selo}>
          <Image
            source={MARCA}
            resizeMode="contain"
            style={estilos.marca}
            accessibilityRole="image"
            accessibilityLabel="Uber"
          />
        </View>

        <Text style={estilos.titulo} accessibilityRole="header">
          Ativar aplicativo
        </Text>

        <Text style={estilos.subtitulo}>
          Digite o <Text style={estilos.forte}>token de ativação</Text> para começar a usar o{' '}
          <Text style={estilos.forte}>Uber Drive</Text>. Cada token é de uso único e válido por
          7 dias.
        </Text>

        <Text style={estilos.rotulo}>TOKEN DE ATIVAÇÃO</Text>

        <TextInput
          value={token}
          onChangeText={digitar}
          placeholder="EX: UBERDRIVE"
          placeholderTextColor="#A6A6B0"
          autoCapitalize="characters"
          autoCorrect={false}
          // O teclado fecha e o botão dispara: quem digita um código espera
          // que "enter" confirme, não que abra uma linha nova.
          returnKeyType="go"
          onSubmitEditing={confirmar}
          style={[estilos.campo, erro && estilos.campoComErro]}
          accessibilityLabel="Token de ativação"
        />

        {erro ? (
          <Text
            style={estilos.erro}
            // `assertive` porque o usuário acabou de agir e está esperando o
            // resultado: o leitor de tela deve interromper para contar.
            accessibilityLiveRegion="assertive"
          >
            {erro}
          </Text>
        ) : null}

        <Botao
          titulo="Ativar agora"
          variante="escuro"
          onPress={confirmar}
          desabilitado={!limpo}
          style={estilos.botao}
        />

        {/* O aviso fica no PÉ, longe do botão, porque não é instrução para
            agir agora — é uma promessa sobre a próxima vez. Colado no campo,
            competiria com o que precisa ser lido primeiro. */}
        <View style={estilos.aviso}>
          <View style={estilos.avisoIcone}>
            <Icone nome="info" tamanho={16} cor="#FFFFFF" />
          </View>
          <Text style={estilos.avisoTexto}>
            Após a ativação, o app abrirá diretamente na próxima vez que você entrar. Sem
            necessidade de novo token.
          </Text>
        </View>
      </ScrollView>
    </Tela>
  );
}

const AMBAR_FUNDO = '#FDF0CE';
const AMBAR_ICONE = '#F5A623';
const AMBAR_TEXTO = '#6B4E12';

const estilos = StyleSheet.create({
  conteudo: {
    flexGrow: 1,
    paddingHorizontal: espaco.lg,
    paddingTop: TOPO_SEGURO + 28,
    paddingBottom: espaco.xl,
  },

  selo: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#000000',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // A marca é um PNG quadrado com folga transparente em volta, então ela
  // ocupa mais que o wordmark aparenta — 62 deixa o "Uber" na proporção do
  // disco sem encostar nas bordas.
  marca: { width: 62, height: 62 },

  titulo: {
    ...tipo.h1,
    color: claro.texto,
    textAlign: 'center',
    marginTop: espaco.lg,
  },
  subtitulo: {
    ...tipo.corpo,
    color: claro.textoSecundario,
    textAlign: 'center',
    marginTop: espaco.sm,
  },
  forte: { fontFamily: familia.bold, color: claro.texto },

  rotulo: {
    ...tipo.secao,
    color: claro.textoSecundario,
    marginTop: espaco.xl,
    marginBottom: espaco.sm,
  },
  campo: {
    height: 56,
    borderRadius: raio.md,
    borderWidth: 1,
    borderColor: claro.borda,
    backgroundColor: claro.superficieAlta,
    paddingHorizontal: espaco.md,
    ...tipo.corpoForte,
    fontFamily: familia.semi,
    color: claro.texto,
  },

  campoComErro: { borderColor: claro.destrutivo },
  erro: { ...tipo.legenda, color: claro.destrutivo, marginTop: 6 },

  botao: { marginTop: espaco.lg },

  // `marginTop: 'auto'` empurra o aviso para o pé sem número mágico: ele fica
  // colado embaixo em telas altas e logo após o botão nas baixas, sem nunca
  // sair da tela.
  aviso: {
    marginTop: 'auto',
    flexDirection: 'row',
    gap: espaco.sm,
    padding: espaco.md,
    borderRadius: raio.md,
    backgroundColor: AMBAR_FUNDO,
  },
  avisoIcone: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: AMBAR_ICONE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avisoTexto: { ...tipo.corpo, color: AMBAR_TEXTO, flex: 1 },
});
