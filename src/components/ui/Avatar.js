import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Icone from './Icone';
import { cores } from '../../theme/cores';

/**
 * AVATAR — a foto do motorista, com um plano B que sempre funciona
 * ===============================================================
 * Existe em quatro telas (Menu, Perfil, Editar perfil, Conta). Centralizar
 * evita o problema clássico: você troca a foto e ela atualiza em três lugares,
 * porque o quarto tinha uma cópia do código.
 *
 * O FALLBACK É A PARTE IMPORTANTE
 * -------------------------------
 * Toda foto vinda de fora pode falhar: o arquivo foi apagado da galeria, o
 * URI expirou, o formato não é suportado. Se o app só desenhasse `<Image>`, o
 * resultado seria um retângulo cinza vazio — e o usuário não teria como saber
 * se é bug ou se a foto sumiu.
 *
 * Por isso escutamos `onError` e voltamos para o ícone. É a diferença entre
 * "não tenho foto" (estado legítimo, com desenho próprio) e "quebrou".
 *
 * A FORMA ORGÂNICA
 * ----------------
 * A tela de perfil público usa uma máscara de "seixo" em vez de círculo —
 * quatro raios de borda diferentes. É o detalhe que dá calor àquela tela.
 * Como é a mesma foto em recortes diferentes, a forma é uma prop, não um
 * segundo componente.
 */
export default function Avatar({ uri, tamanho = 56, forma = 'circulo', style }) {
  const [falhou, setFalhou] = useState(false);

  // Se a URI mudar, damos uma nova chance: o erro anterior era daquela foto,
  // não desta. Sem isto, um erro deixaria o avatar preso no ícone para sempre.
  const [uriAnterior, setUriAnterior] = useState(uri);
  if (uri !== uriAnterior) {
    setUriAnterior(uri);
    setFalhou(false);
  }

  const molde =
    forma === 'organica'
      ? {
          borderTopLeftRadius: tamanho * 0.58,
          borderTopRightRadius: tamanho * 0.42,
          borderBottomRightRadius: tamanho * 0.52,
          borderBottomLeftRadius: tamanho * 0.48,
        }
      : { borderRadius: tamanho / 2 };

  const base = [
    estilos.caixa,
    { width: tamanho, height: tamanho },
    molde,
    style,
  ];

  if (!uri || falhou) {
    return (
      <View style={base}>
        <Icone nome="person" tamanho={tamanho * 0.54} cor={cores.textoTerciario} />
      </View>
    );
  }

  return (
    <View style={base}>
      <Image
        source={{ uri }}
        style={[StyleSheet.absoluteFill, molde]}
        // `cover` recorta o excesso mantendo a proporção. Com `contain` a foto
        // caberia inteira e sobrariam faixas vazias dentro do círculo; com
        // `stretch` o rosto distorce. Para avatar, é sempre cover.
        resizeMode="cover"
        onError={() => setFalhou(true)}
        accessibilityRole="image"
        accessibilityLabel="Foto do perfil"
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: {
    backgroundColor: cores.superficieAlta,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
