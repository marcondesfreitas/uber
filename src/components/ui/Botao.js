import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Icone from './Icone';
import Pressionavel from './Pressionavel';
import { claro, cores, raio } from '../../theme/cores';
import { familia, tipo } from '../../theme/tipografia';

/**
 * BOTÃO — pill de 52 px de altura (§3)
 * ------------------------------------
 * Uma única implementação com quatro `variante`s em vez de quatro componentes.
 * Regra prática: se dois componentes só diferem em cor, eles são UM componente
 * com uma prop. Se diferem em ESTRUTURA, aí sim são dois.
 *
 *   primario  azul       — a ação principal ("Ficar online", "Cheguei")
 *   fantasma  cinza      — ação secundária no escuro ("Fechar", "Redefinir")
 *   claro     branco     — ação principal sobre o mundo claro ("Salvar")
 *   escuro    preto      — ação principal sobre fundo claro ("Iniciar viagem")
 *   texto     invisível  — ação terciária ("Cancelar viagem")
 *
 * A altura de 52 px também resolve acessibilidade: o alvo mínimo de toque
 * recomendado é 44×44 px (§9), e passamos folgado.
 */
export default function Botao({
  titulo,
  onPress,
  variante = 'primario',
  icone,
  carregando = false,
  desabilitado = false,
  destrutivo = false,
  corTexto,
  style,
}) {
  const v = VARIANTES[variante] || VARIANTES.primario;
  // Precedência: destrutivo vence tudo (é um aviso), depois a cor pedida
  // explicitamente, e só então o padrão da variante.
  const cor = destrutivo ? claro.destrutivo : corTexto || v.texto;

  return (
    <Pressionavel
      onPress={onPress}
      desabilitado={desabilitado || carregando}
      accessibilityLabel={titulo}
      style={[estilos.base, { backgroundColor: v.fundo }, v.borda, style]}
    >
      <View style={estilos.conteudo}>
        {carregando ? (
          <ActivityIndicator color={cor} />
        ) : (
          <>
            {icone ? <Icone nome={icone} tamanho={21} cor={cor} /> : null}
            <Text style={[estilos.texto, v.peso, { color: cor }]}>{titulo}</Text>
          </>
        )}
      </View>
    </Pressionavel>
  );
}

const VARIANTES = {
  primario: { fundo: cores.acao, texto: '#FFFFFF', peso: { fontFamily: familia.bold } },
  fantasma: { fundo: cores.superficieAlta, texto: cores.texto, peso: { fontFamily: familia.semi } },
  claro: { fundo: '#FFFFFF', texto: claro.texto, peso: { fontFamily: familia.bold } },
  escuro: { fundo: claro.texto, texto: '#FFFFFF', peso: { fontFamily: familia.bold } },
  texto: { fundo: 'transparent', texto: cores.textoSecundario, peso: { fontFamily: familia.semi } },
};

const estilos = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: raio.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  conteudo: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  texto: { ...tipo.h3, fontFamily: familia.bold },
});
