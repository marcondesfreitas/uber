import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Botao from './ui/Botao';
import {
  PALETA_DEMANDA,
  corSolida,
  estimarGanho,
} from '../services/precoDinamico';
import { cores, espaco, raio, tempo } from '../theme/cores';
import { brl, familia, multiplicador, tipo } from '../theme/tipografia';
import { DRIVER_NATIVO } from '../theme/animacao';

/**
 * PAINEL DA ZONA SELECIONADA
 * ==========================
 * Aparece quando o motorista toca numa célula quente do mapa.
 *
 * O QUE MUDOU EM RELAÇÃO AO MÓDULO 1.5
 * ------------------------------------
 * Antes o painel liderava com o MULTIPLICADOR em corpo 30. Agora lidera com o
 * RÓTULO ("Muito alta") e o multiplicador vira um selo colorido ao lado.
 *
 * A razão é de leitura: "1,9x" só significa algo para quem já entendeu o
 * sistema de surge. "Muito alta" significa algo para todo mundo, no primeiro
 * dia. O número continua ali — quem aprendeu a usá-lo não perde nada — mas
 * deixou de ser a porta de entrada.
 *
 * A grade 2×2 embaixo responde às quatro perguntas na ordem em que elas
 * aparecem na cabeça: quantos pedidos, quantos carros, qual a disputa, quanto
 * eu ganho. A última é a única em verde: é a resposta que motiva a atravessar
 * a cidade.
 *
 * ⚠️ Todos os números são simulados no aparelho (Módulo 1.5) — por isso o
 * rodapé com o aviso técnico. Dado convincente sem etiqueta é como um
 * protótipo é confundido com um sistema real.
 */
export default function PainelZona({ zona, onFechar }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const a = Animated.timing(anim, {
      toValue: 1,
      duration: tempo.padrao,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
      useNativeDriver: DRIVER_NATIVO,
    });
    a.start();
    return () => a.stop();
  }, [anim, zona && zona.id]);

  if (!zona) return null;

  const faixa = PALETA_DEMANDA[zona.nivel];
  const porCarro = (zona.pedidos / Math.max(zona.motoristas, 1)).toFixed(1).replace('.', ',');

  return (
    <Animated.View
      style={[
        estilos.caixa,
        {
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
        },
      ]}
    >
      <View style={estilos.cabecalho}>
        <View style={{ flex: 1 }}>
          <Text style={estilos.rotuloSecao}>Zona selecionada</Text>
          <Text style={estilos.rotulo}>{faixa.rotulo}</Text>
        </View>

        <View style={[estilos.selo, { backgroundColor: corSolida(Math.max(zona.nivel, 1)) }]}>
          <Text style={estilos.seloTexto}>{multiplicador(zona.multiplicador)}</Text>
        </View>
      </View>

      <View style={estilos.grade}>
        <Item rotulo="Pedidos" valor={String(zona.pedidos)} />
        <Item rotulo="Motoristas" valor={String(zona.motoristas)} />
        <Item rotulo="Pedidos por carro" valor={porCarro} />
        <Item rotulo="Ganho estimado" valor={brl(estimarGanho(zona.multiplicador))} destaque />
      </View>

      <Text style={estilos.avisoInline}>
        Aviso técnico: demanda e valores simulados no aparelho.
      </Text>

      <Botao titulo="Fechar" variante="fantasma" onPress={onFechar} style={estilos.fechar} />
    </Animated.View>
  );
}

function Item({ rotulo, valor, destaque }) {
  // Duas Views aninhadas de propósito: a de fora reserva metade da largura e
  // cria o espaço entre os cards (padding); a de dentro é o card pintado.
  // Colocar o padding e o fundo na MESMA View faria os quatro se encostarem.
  return (
    <View style={estilos.celula}>
      <View style={estilos.item} accessibilityLabel={`${rotulo}: ${valor}`}>
        <Text style={estilos.itemRotulo}>{rotulo}</Text>
        <Text style={[estilos.itemValor, destaque && { color: cores.online }]}>{valor}</Text>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: {
    padding: espaco.md,
    borderRadius: raio.md + 2,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: -8 },
    elevation: 16,
  },
  cabecalho: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  rotuloSecao: { ...tipo.secao, color: cores.textoTerciario },
  rotulo: { ...tipo.h2, fontFamily: familia.extra, color: cores.texto, marginTop: 5 },
  selo: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: raio.campo },
  seloTexto: { ...tipo.h3, fontFamily: familia.extra, color: '#FFFFFF', fontVariant: ['tabular-nums'] },

  // Duas colunas com wrap — o equivalente RN de um grid 2×2.
  grade: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 16, marginHorizontal: -6 },
  celula: { width: '50%', padding: 6 },
  item: { padding: 12, borderRadius: raio.campo, backgroundColor: cores.superficieAlta },
  itemRotulo: { ...tipo.micro, fontFamily: familia.semi, color: cores.textoSecundario },
  itemValor: { ...tipo.h2, color: cores.texto, marginTop: 3, fontVariant: ['tabular-nums'] },

  avisoInline: { ...tipo.micro, fontSize: 10, fontFamily: familia.media, color: cores.textoTerciario, marginTop: 12 },

  fechar: { height: 44, borderRadius: 22, marginTop: 10 },
});
