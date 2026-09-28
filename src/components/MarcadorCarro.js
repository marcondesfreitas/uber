import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { cores, raio } from '../theme/cores';

/**
 * MARCADOR PERSONALIZADO
 * ----------------------
 * O <Marker> do react-native-maps aceita componentes React como filhos:
 * tudo que estiver dentro dele vira o "pino" desenhado sobre o mapa.
 *
 * - anchor={{x:0.5,y:0.5}} centraliza o desenho na coordenada.
 * - rotation gira o marcador conforme a direção (heading) do aparelho,
 *   igual ao carrinho do Uber que aponta para onde você dirige.
 * - flat={true} faz o marcador "deitar" no mapa (gira junto com o mapa)
 *   em vez de ficar em pé como um alfinete.
 */
export default function MarcadorCarro({ coordenada, direcao = 0, online }) {
  if (!coordenada) return null;

  return (
    <Marker
      coordinate={coordenada}
      anchor={{ x: 0.5, y: 0.5 }}
      flat
      rotation={direcao}
      tracksViewChanges={false} // performance: não re-renderiza a imagem a cada frame
    >
      <View style={estilos.area}>
        <View style={[estilos.halo, { backgroundColor: online ? 'rgba(31,214,95,0.25)' : 'rgba(107,107,118,0.25)' }]} />
        <View style={[estilos.carro, { backgroundColor: online ? cores.online : cores.offline }]}>
          <Text style={estilos.emoji}>🚗</Text>
        </View>
      </View>
    </Marker>
  );
}

const estilos = StyleSheet.create({
  area: { alignItems: 'center', justifyContent: 'center', width: 64, height: 64 },
  halo: { position: 'absolute', width: 60, height: 60, borderRadius: raio.redondo },
  carro: {
    width: 34,
    height: 34,
    borderRadius: raio.redondo,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0B0B0F',
  },
  emoji: { fontSize: 16 },
});
