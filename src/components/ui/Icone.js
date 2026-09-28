import React from 'react';
// Importados um a um, e não de '@expo/vector-icons'. O índice do pacote faz
// require() das 19 famílias de ícones, e o empacotador copia todas — 3,5 MB
// de fontes para um app que usa duas. Mesmo motivo dos pesos da Inter no
// App.js: índice de pacote costuma arrastar o pacote inteiro.
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

/**
 * ÍCONE — a única porta de entrada de ícones do app
 * -------------------------------------------------
 * Todo componente pede ícone por AQUI, nunca importando MaterialIcons direto.
 *
 * Por quê? Porque "de onde vêm os ícones" é uma decisão que muda: hoje é o
 * `@expo/vector-icons` (que já vem instalado com o Expo), amanhã pode ser um
 * pacote de SVGs próprios. Com um adaptador, essa troca é UM arquivo.
 *
 * DUAS BIBLIOTECAS, UM NOME SÓ
 * ----------------------------
 * O MaterialIcons cobre quase tudo, mas tem buracos — não existe volante de
 * carro nele, por exemplo, e o app precisa de um. O MaterialCommunityIcons
 * cobre esses casos com outro conjunto.
 *
 * Em vez de fazer cada tela escolher a biblioteca (e ter de lembrar qual nome
 * mora onde), procuramos no MaterialIcons e caímos no Community quando não
 * acharmos. Quem chama só diz o nome; a busca é problema deste arquivo.
 *
 * Detalhe de tradução: a especificação foi escrita com nomes do Material
 * Symbols (`local_fire_department`, snake_case). As duas bibliotecas usam
 * kebab-case (`local-fire-department`). Em vez de manter uma tabela de 50
 * linhas que envelhece, convertemos — os catálogos compartilham os nomes.
 */
export default function Icone({ nome, tamanho = 22, cor = '#FFFFFF', style }) {
  const nomeReal = paraKebab(nome);

  const noMaterial = nomeReal in MaterialIcons.glyphMap;
  const noCommunity = nomeReal in MaterialCommunityIcons.glyphMap;

  // Um nome inexistente NÃO dá erro: o React Native desenha um quadrado vazio
  // e você só descobre olhando a tela. Como o app tem dezenas de ícones
  // espalhados por 16 telas, isso passa batido com facilidade.
  //
  // `__DEV__` é uma variável global do React Native: `true` no servidor de
  // desenvolvimento, `false` no build de produção. O aviso some sozinho na
  // versão publicada, então checar aqui não custa nada ao usuário final.
  if (__DEV__ && !noMaterial && !noCommunity) {
    console.warn(
      `Icone: "${nome}" não existe em MaterialIcons nem em MaterialCommunityIcons ` +
        `(procurei por "${nomeReal}"). Confira o catálogo em icons.expo.fyi.`
    );
  }

  const Familia = noMaterial ? MaterialIcons : MaterialCommunityIcons;

  return (
    <Familia
      name={noMaterial || noCommunity ? nomeReal : 'help-circle-outline'}
      size={tamanho}
      color={cor}
      style={style}
      // O ícone é decorativo: quem descreve a ação é o accessibilityLabel do
      // botão que o contém. Marcar os dois faz o leitor de tela falar duas vezes.
      accessible={false}
      importantForAccessibility="no"
    />
  );
}

/** `local_fire_department` → `local-fire-department` */
function paraKebab(nome) {
  return String(nome || 'help-outline').replace(/_/g, '-');
}
