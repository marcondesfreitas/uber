import React, { useEffect, useRef } from 'react';
import { Animated, StatusBar, StyleSheet, View } from 'react-native';
import { useApp } from '../estado/AppProvider';
import { DRIVER_NATIVO } from '../theme/animacao';

/**
 * SPLASH (§5.1) — a marca sobre o escuro, e só
 * ============================================
 *
 * O QUE A GRAVAÇÃO MOSTRAVA, E O QUE FICOU
 * ----------------------------------------
 * O vídeo original tinha duas fases: 2,3 s de tela escura vazia, um crossfade,
 * e 1,3 s de tela CLARA com "Verificando acesso…" encostado no alto à
 * esquerda. A primeira versão desta tela reproduzia as duas.
 *
 * A fase clara saiu. Ela era fiel, mas custava um corte de preto para branco a
 * plena tela na abertura, e um texto de sistema que só faz sentido enquanto o
 * app real conversa com um servidor. Aqui não há servidor — era espera
 * encenada, e encenar espera é o oposto do que se deve fazer no primeiro
 * segundo de uso.
 *
 * Sobre o vazio da tela escura: no vídeo ele é real, e isso foi verificado, não
 * suposto — a luminância média fica achatada em 17,0–18,2 nos 2,3 segundos,
 * sem oscilar, o que descarta qualquer coisa animada. A marca que você vê aqui
 * é uma escolha nossa, não uma leitura da gravação: a splash de marca do app
 * real é desenhada pelo SISTEMA, antes de qualquer JavaScript rodar, e
 * provavelmente acontece nos milissegundos anteriores ao início da captura.
 *
 * COMO TROCAR A MARCA
 * -------------------
 * Não mexa aqui: `assets/marca.png` é GERADO por `scripts/gerar-icones.js` a
 * partir de `assets/marca-fonte.png`. Troque a origem, rode o script, e a
 * splash, os ícones e a prévia de link mudam juntos.
 *
 * Logotipo é ARQUIVO, não desenho em código: um wordmark redesenhado à mão
 * com Views nunca sai com o traço certo, e é o tipo de detalhe que uma banca
 * repara. A splash do sistema aponta o mesmo arquivo pelo `app.json`.
 */

/** Fundo transparente, para assentar sobre a camada escura da tela. */
const MARCA = require('../../assets/marca.png');

/** Os 2,3 s de tela escura medidos no vídeo. Fase única — ver o cabeçalho. */
const MS_SPLASH = 2300;

const COR_ESCURA = '#0B0B0B';

export default function SplashScreen() {
  const { concluirSplash } = useApp();

  const marca = useRef(new Animated.Value(0)).current;

  // ── Entrada da marca ─────────────────────────────────────────────────────
  useEffect(() => {
    const a = Animated.spring(marca, { toValue: 1, friction: 6, tension: 60, useNativeDriver: DRIVER_NATIVO });
    a.start();
    return () => a.stop();
  }, [marca]);

  // ── Splash → app ─────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(concluirSplash, MS_SPLASH);
    return () => clearTimeout(t);
  }, [concluirSplash]);

  return (
    <View style={estilos.tela}>
      {/* Fundo escuro o tempo todo, então ícones claros. */}
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <View style={estilos.centro} pointerEvents="none">
        <Animated.Image
          source={MARCA}
          resizeMode="contain"
          accessibilityRole="image"
          accessibilityLabel="Logotipo do aplicativo"
          style={[
            estilos.marca,
            {
              opacity: marca,
              transform: [
                { scale: marca.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1] }) },
              ],
            },
          ]}
        />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: COR_ESCURA },
  centro: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  // Quadrado porque o PNG é quadrado (a arte vem centrada nele, com folga
  // transparente em cima e embaixo). 168 deixa o wordmark com a mesma presença
  // que 132 dava a um símbolo, que ocuparia o quadrado inteiro.
  marca: { width: 168, height: 168 },
});
