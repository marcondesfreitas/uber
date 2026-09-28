import React from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { claro, cores } from '../../theme/cores';

/**
 * TELA — o contêiner base de todas as telas
 * -----------------------------------------
 * Resolve dois problemas chatos e universais de layout mobile:
 *
 * 1) A ÁREA SEGURA DO TOPO. No iOS o notch/Dynamic Island come ~54 px; no
 *    Android a barra de status tem altura variável por fabricante. O
 *    `SafeAreaView` do react-native só funciona no iOS — no Android ele é um
 *    `View` comum. Por isso somamos `StatusBar.currentHeight` manualmente.
 *
 *    (Num app de produção você usaria `react-native-safe-area-context`, que
 *    também resolve rotação e telas dobráveis. Aqui fazemos à mão para você
 *    ver que não é mágica: é uma constante do sistema operacional.)
 *
 * 2) O MUNDO CLARO vs. ESCURO. A prop `tema` troca fundo e cor da barra de
 *    status juntos. Trocar um sem o outro produz o clássico "ícones brancos
 *    sobre fundo branco" — invisíveis, e ninguém testa isso.
 */

/**
 * A ÁREA SEGURA DO NAVEGADOR, MEDIDA EM VEZ DE CHUTADA
 * ----------------------------------------------------
 * No iPhone a barra de status e o indicador de gestos ocupam faixas cuja
 * altura muda por aparelho — Dynamic Island, notch e telas antigas são todos
 * diferentes. O sistema informa os valores em `env(safe-area-inset-*)`, mas
 * isso é CSS: não dá para somar a um número dentro de um StyleSheet.
 *
 * A sonda abaixo resolve criando um elemento invisível cuja altura é
 * exatamente o inset, medindo, e removendo. Uma vez, no carregamento.
 *
 * Só funciona porque o `<meta viewport>` publicado leva `viewport-fit=cover`
 * (veja `scripts/injetar-head.js`) — sem ele o navegador reporta zero, e o
 * app fica desenhado abaixo da barra de status com uma tarja branca no topo.
 *
 * O padding vai no CONTEÚDO, nunca na raiz: o fundo e o mapa precisam chegar
 * às bordas da tela. Encostar a raiz para dentro deixa faixas vazias e um app
 * que parece pequeno demais para o aparelho.
 */
function medirAreaSegura(lado) {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return 0;
  try {
    const sonda = document.createElement('div');
    sonda.style.cssText =
      'position:fixed;visibility:hidden;pointer-events:none;top:0;left:0;' +
      `height:env(safe-area-inset-${lado},0px);width:env(safe-area-inset-${lado},0px)`;
    document.documentElement.appendChild(sonda);
    const r = sonda.getBoundingClientRect();
    sonda.remove();
    return Math.round(lado === 'top' || lado === 'bottom' ? r.height : r.width);
  } catch (e) {
    // Navegador sem suporte a env(): segue com zero, que é o certo num
    // desktop — lá não existe barra de status por cima do conteúdo.
    return 0;
  }
}

const RESPIRO = 8;

export const TOPO_SEGURO = Platform.select({
  ios: 54,
  android: (StatusBar.currentHeight || 24) + 12,
  default: medirAreaSegura('top') + RESPIRO,
});

/** Altura reservada embaixo para o home indicator / barra de gestos. */
export const BASE_SEGURA = Platform.select({
  ios: 20,
  android: 12,
  default: medirAreaSegura('bottom') + RESPIRO,
});

export default function Tela({ children, tema = 'escuro', style }) {
  const fundo = tema === 'claro' ? claro.fundo : cores.fundo;

  return (
    <View style={[estilos.tela, { backgroundColor: fundo }, style]}>
      <StatusBar
        barStyle={tema === 'claro' ? 'dark-content' : 'light-content'}
        backgroundColor="transparent"
        translucent
      />
      {children}
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1 },
});
