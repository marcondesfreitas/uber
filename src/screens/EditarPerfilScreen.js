import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import AppBar from '../components/ui/AppBar';
import Avatar from '../components/ui/Avatar';
import Botao from '../components/ui/Botao';
import Campo from '../components/ui/Campo';
import Icone from '../components/ui/Icone';
import SeletorFoto from '../components/ui/SeletorFoto';
import Tela, { TOPO_SEGURO } from '../components/ui/Tela';
import { useApp } from '../estado/AppProvider';
import { motorista } from '../data/mock';
import { cores, espaco, raio } from '../theme/cores';
import { tipo } from '../theme/tipografia';

/**
 * EDITAR PERFIL (§5.5)
 * --------------------
 * Formulário longo, e formulário longo tem duas armadilhas em mobile:
 *
 * 1) O TECLADO COBRE O CAMPO. `KeyboardAvoidingView` empurra o conteúdo para
 *    cima quando o teclado abre. iOS e Android tratam isso de formas
 *    diferentes ('padding' vs 'height') — por isso o `Platform.select`.
 *
 * 2) O USUÁRIO PERDE O QUE DIGITOU. Aqui o estado é LOCAL até o "Salvar":
 *    editar o contexto global a cada tecla faria o nome mudar no menu enquanto
 *    a pessoa ainda está digitando, e "Redefinir" não teria como voltar.
 *    Rascunho local + confirmação explícita é o padrão certo para formulários.
 */
export default function EditarPerfilScreen() {
  const { navegar, perfil, setPerfil, mostrarToast } = useApp();

  // O rascunho. Começa como cópia do que está salvo.
  const [rascunho, setRascunho] = useState(perfil);

  const definir = (chave) => (valor) => setRascunho((r) => ({ ...r, [chave]: valor }));

  function salvar() {
    setPerfil(rascunho);
    navegar('perfil');
    mostrarToast('Perfil atualizado');
  }

  function redefinir() {
    setRascunho(perfil);
    mostrarToast('Alterações descartadas');
  }

  /**
   * A foto entra no RASCUNHO, como qualquer outro campo — só vira oficial no
   * "Salvar". Assim "Redefinir" desfaz a troca de foto junto com o resto, e
   * sair da tela sem salvar não deixa metade da edição aplicada.
   *
   * Quem abre a galeria é o `SeletorFoto`, que muda de implementação conforme
   * a plataforma. Esta função só recebe o resultado.
   */
  function receberFoto(r) {
    // Desistir não é erro: nada muda e nada é dito. Um alerta aqui trataria
    // "mudei de ideia" como falha.
    if (r.status === 'cancelado') return;

    if (r.status === 'ok') {
      setRascunho((d) => ({ ...d, foto: r.uri }));
      mostrarToast('Foto escolhida — toque em Salvar');
      return;
    }

    mostrarToast(r.mensagem);
  }

  function removerFoto() {
    if (!rascunho.foto) {
      mostrarToast('Você ainda não tem foto');
      return;
    }
    setRascunho((d) => ({ ...d, foto: null }));
    mostrarToast('Foto removida — toque em Salvar');
  }

  return (
    <Tela>
      <AppBar titulo="Editar perfil" onVoltar={() => navegar('perfil')} alturaTopo={TOPO_SEGURO} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >
        <ScrollView
          contentContainerStyle={estilos.conteudo}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={estilos.blocoFoto}>
            <Avatar uri={rascunho.foto} tamanho={56} />
            <View style={estilos.acoesFoto}>
              <SeletorFoto titulo="Escolher foto" onEscolher={receberFoto} />
              <Botao titulo="Remover" variante="fantasma" onPress={removerFoto} style={estilos.botaoFoto} />
            </View>
          </View>

          <View style={estilos.campos}>
            <Campo rotulo="Nome" valor={rascunho.nome} onChangeText={definir('nome')} />

            {/* A nota NÃO é editável — e mostrar o campo desabilitado em vez de
                escondê-lo é deliberado: o motorista precisa saber que ela
                existe e que não depende dele. */}
            <Campo rotulo="Nota" somenteLeitura>
              <Icone nome="star" tamanho={18} cor={cores.textoTerciario} />
              <Text style={estilos.leitura}>{motorista.nota.toFixed(2).replace('.', ',')}</Text>
            </Campo>

            <Campo
              rotulo="E-mail"
              valor={rascunho.email}
              onChangeText={definir('email')}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Campo rotulo="Gênero" valor={rascunho.genero} onChangeText={definir('genero')} />
            <Campo
              rotulo="Número de telefone"
              valor={rascunho.telefone}
              onChangeText={definir('telefone')}
              keyboardType="phone-pad"
            />
            <Campo rotulo="Idioma" valor={rascunho.idioma} onChangeText={definir('idioma')} />
            <Campo rotulo="Texto do perfil público" valor={rascunho.bio} onChangeText={definir('bio')} />
            <Campo rotulo="Cidade do perfil público" valor={rascunho.cidade} onChangeText={definir('cidade')} />
          </View>

          <View style={estilos.acoes}>
            <Botao titulo="Salvar" variante="claro" onPress={salvar} />
            <Botao titulo="Redefinir" variante="fantasma" onPress={redefinir} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  conteudo: { paddingHorizontal: espaco.md, paddingBottom: 48 },

  blocoFoto: {
    flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14,
    borderRadius: raio.md, backgroundColor: cores.superficie,
    borderWidth: 1, borderColor: cores.borda,
  },
  acoesFoto: { flex: 1, gap: 8 },
  botaoFoto: { height: 40, borderRadius: 20 },

  campos: { gap: 16, marginTop: 22 },
  leitura: { ...tipo.corpo, color: cores.textoTerciario },

  acoes: { gap: 10, marginTop: 26 },
});
