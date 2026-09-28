import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { cores, raio } from '../../theme/cores';
import { tipo } from '../../theme/tipografia';

/**
 * CAMPO DE FORMULÁRIO (§3 `Field`)
 * --------------------------------
 * Rótulo ACIMA do campo, não dentro dele.
 *
 * Rótulo flutuante ("placeholder que vira label") parece elegante e é uma
 * armadilha: quando o usuário começa a digitar, o rótulo encolhe e some da
 * área de leitura confortável — e quem tem dislexia ou está dirigindo perde
 * a referência do que aquele campo era. Rótulo fixo custa 20 px e nunca some.
 *
 * O estado de FOCO troca a cor da borda para `--acao`. É o único sinal de
 * "é aqui que o teclado está escrevendo" quando o teclado cobre metade da tela.
 */
export default function Campo({
  rotulo,
  valor,
  onChangeText,
  somenteLeitura = false,
  autoCapitalize = 'sentences',
  keyboardType = 'default',
  style,
  children,
}) {
  const [focado, setFocado] = useState(false);

  return (
    <View style={style}>
      <Text style={estilos.rotulo}>{rotulo}</Text>

      {somenteLeitura ? (
        <View style={[estilos.caixa, estilos.caixaLeitura]}>{children}</View>
      ) : (
        <TextInput
          value={valor}
          onChangeText={onChangeText}
          onFocus={() => setFocado(true)}
          onBlur={() => setFocado(false)}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          // O teclado do sistema é claro por padrão; num app escuro ele
          // "pisca branco" ao abrir. `keyboardAppearance` conserta no iOS.
          keyboardAppearance="dark"
          selectionColor={cores.acao}
          accessibilityLabel={rotulo}
          style={[estilos.caixa, estilos.input, focado && { borderColor: cores.acao }]}
        />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  rotulo: { ...tipo.corpoForte, color: cores.texto, marginBottom: 7 },
  caixa: {
    height: 48,
    paddingHorizontal: 14,
    borderRadius: raio.campo,
    borderWidth: 1,
    borderColor: cores.borda,
    justifyContent: 'center',
  },
  input: {
    backgroundColor: cores.superficieAlta,
    color: cores.texto,
    ...tipo.corpo,
    // No Android o TextInput tem padding vertical embutido que desalinha o
    // texto dentro de uma altura fixa. Zerar resolve nos dois sistemas.
    paddingVertical: 0,
  },
  caixaLeitura: { backgroundColor: cores.superficie, flexDirection: 'row', alignItems: 'center', gap: 6 },
});
