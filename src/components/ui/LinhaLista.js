import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icone from './Icone';
import { cores } from '../../theme/cores';
import { tipo } from '../../theme/tipografia';

/**
 * LINHA DE LISTA (§3 `ListRow`)
 * -----------------------------
 * ícone · título · subtítulo opcional · chevron
 *
 * Duas decisões que se repetem em todo app de lista:
 *
 * 1) O CHEVRON não é enfeite — ele é a promessa de que o toque LEVA A ALGUM
 *    LUGAR. Linha sem chevron deve fazer algo no lugar (abrir um seletor,
 *    alternar um estado). Misturar os dois sem sinal visual confunde.
 *
 * 2) O `pressed` pinta o fundo em vez de encolher a linha. Encolher funciona
 *    em botão isolado; numa lista, encolher uma linha faz as vizinhas
 *    "pularem" e a lista inteira parece instável.
 */
export default function LinhaLista({
  icone,
  titulo,
  subtitulo,
  onPress,
  chevron = true,
  direita,
  divisor = false,
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={subtitulo ? `${titulo}. ${subtitulo}` : titulo}
      style={({ pressed }) => [estilos.linha, divisor && estilos.comDivisor, pressed && estilos.pressionada]}
    >
      {icone ? <Icone nome={icone} tamanho={22} cor={cores.texto} /> : null}

      <View style={estilos.meio}>
        <Text style={estilos.titulo}>{titulo}</Text>
        {subtitulo ? <Text style={estilos.subtitulo}>{subtitulo}</Text> : null}
      </View>

      {direita}
      {chevron ? <Icone nome="chevron_right" tamanho={20} cor={cores.textoTerciario} /> : null}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 15,
    paddingHorizontal: 16,
    minHeight: 56, // alvo de toque confortável (§9)
  },
  // O divisor vai na BORDA DE BAIXO, não numa View separada entre as linhas:
  // assim ele acompanha o estado pressionado e some junto com a linha quando
  // a lista é filtrada. Separador como elemento independente é o que produz
  // aquelas listas com duas linhas grudadas no fim de um filtro.
  comDivisor: { borderBottomWidth: 1, borderBottomColor: cores.superficie },
  pressionada: { backgroundColor: cores.superficieAlta },
  meio: { flex: 1, minWidth: 0 },
  titulo: { ...tipo.corpoForte, color: cores.texto },
  subtitulo: { ...tipo.legenda, color: cores.textoSecundario, marginTop: 2 },
});
