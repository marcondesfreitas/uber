import React from 'react';
import { StyleSheet, View } from 'react-native';
import Botao from './Botao';
import { escolherDaGaleria } from '../../services/fotoPerfil';

/**
 * SELETOR DE FOTO — versão NATIVA (iOS e Android)
 * ==============================================
 * Um botão que abre a galeria do aparelho. Mesma interface do
 * `SeletorFoto.web.js`; o Metro escolhe cada um pela plataforma.
 *
 * Aqui é simples: no celular NÃO existe a restrição de "user activation" que
 * complica a web — o sistema operacional deixa o app abrir o seletor de mídia
 * quando quiser, e a permissão é pedida por uma API própria.
 *
 * A complexidade da web (input transparente sobreposto ao botão) fica lá, no
 * arquivo dela. É a vantagem de separar por plataforma em vez de encher o
 * componente de `if (Platform.OS === 'web')`: cada lado carrega só o próprio
 * problema.
 */
export default function SeletorFoto({ titulo = 'Escolher foto', variante = 'claro', onEscolher, style }) {
  async function abrir() {
    const r = await escolherDaGaleria();
    onEscolher(r);
  }

  return (
    <View style={style}>
      <Botao titulo={titulo} variante={variante} onPress={abrir} style={estilos.botao} />
    </View>
  );
}

const estilos = StyleSheet.create({
  botao: { height: 40, borderRadius: 20 },
});
