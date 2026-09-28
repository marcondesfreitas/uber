import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';

import CamadaDemanda from './CamadaDemanda';
import MarcadorCarro from './MarcadorCarro';
import Icone from './ui/Icone';
import { REGIAO_PADRAO } from '../data/locais';
import { cores, estiloMapaEscuro } from '../theme/cores';

/**
 * SUPERFÍCIE DO MAPA — versão NATIVA (iOS e Android)
 * ==================================================
 *
 * POR QUE ESTE ARQUIVO EXISTE
 * ---------------------------
 * O `react-native-maps` é um módulo NATIVO: ele importa arquivos internos do
 * React Native que simplesmente não existem no `react-native-web`. Tentar
 * empacotar o app para a web com ele dá um erro de resolução no Metro, e não
 * há flag que resolva — a biblioteca não tem implementação para navegador.
 *
 * A saída não é encher a tela de `if (Platform.OS === 'web')`. É a resolução
 * por PLATAFORMA do Metro: quando alguém escreve
 *
 *     import SuperficieMapa from '../components/SuperficieMapa';
 *
 * o empacotador procura primeiro por `SuperficieMapa.web.js` na build web, e
 * só cai neste arquivo no nativo. As duas versões têm a MESMA interface de
 * props, então a tela que as usa não sabe (nem precisa saber) em qual está.
 *
 * É o mesmo mecanismo dos arquivos `.ios.js` / `.android.js` do próprio React
 * Native, e a forma canônica de isolar uma dependência que não existe em toda
 * plataforma: um arquivo por mundo, em vez de condicionais espalhadas.
 *
 * TODA A LÓGICA DE CÂMERA MORA AQUI
 * ---------------------------------
 * `animateCamera` e `fitToCoordinates` são API do MapView. Deixá-las na tela
 * obrigaria a tela a saber que existe um MapView — e aí a versão web teria de
 * fingir ter uma. Encapsulando, a tela só diz O QUE quer ver; como enquadrar
 * é problema de cada superfície.
 */

/**
 * A superfície nativa precisa de coordenadas reais: sem GPS ela mostra o mapa
 * de Fortaleza, mas o puck do motorista não tem onde ficar. A tela usa esta
 * constante para decidir se um erro de localização vira tela de erro.
 */
export const PRECISA_GPS = true;

export default function SuperficieMapa({
  local,
  zonas,
  mostrarDemanda,
  onSelecionarZona,
  rota,
  paradas = [],
  seguindo,
  dirigindo,
  onArrastar,
  onTocarFundo,
  estatico = false,
}) {
  const mapaRef = useRef(null);

  // Câmera de acompanhamento. Ocioso: de cima, aberto (você avalia a cidade).
  // Em corrida: inclinada e mais perto (você navega).
  useEffect(() => {
    if (estatico || !local || !seguindo || !mapaRef.current) return;
    mapaRef.current.animateCamera(
      {
        center: { latitude: local.latitude, longitude: local.longitude },
        pitch: dirigindo ? 45 : 0,
        zoom: dirigindo ? 15.5 : 14,
      },
      { duration: 700 }
    );
  }, [estatico, local, seguindo, dirigindo]);

  // Ao começar uma corrida, enquadra a rota inteira. `fitToCoordinates` é a
  // forma correta de dizer "mostre tudo isto" — calcular centro e zoom na mão
  // erra sempre que a rota é mais larga que alta, ou vice-versa.
  useEffect(() => {
    if (!rota || !mapaRef.current) return;
    mapaRef.current.fitToCoordinates(rota, {
      // O padding de baixo é grande porque o sheet da corrida cobre uns 40%
      // da tela: sem isso, metade da rota nasce escondida atrás dele.
      edgePadding: { top: 160, right: 60, bottom: 320, left: 60 },
      animated: true,
    });
  }, [rota]);

  return (
    <MapView
      ref={mapaRef}
      style={StyleSheet.absoluteFill}
      provider={PROVIDER_GOOGLE}
      customMapStyle={estiloMapaEscuro}
      initialRegion={REGIAO_PADRAO}
      showsUserLocation={false}
      showsMyLocationButton={false}
      showsCompass={false}
      toolbarEnabled={false}
      // Modo estático: a miniatura da Início é uma PRÉVIA, não um mapa para
      // navegar. Se ela aceitasse arrastar, o dedo que tenta rolar a tela
      // acabaria movendo o mapa — e a página inteira travaria sob o polegar.
      // É o problema clássico de mapa embutido dentro de lista rolável.
      scrollEnabled={!estatico}
      zoomEnabled={!estatico}
      rotateEnabled={!estatico}
      pitchEnabled={!estatico}
      onPanDrag={estatico ? undefined : onArrastar}
      onPress={estatico ? undefined : onTocarFundo}
    >
      {mostrarDemanda ? (
        <CamadaDemanda zonas={zonas} onSelecionarZona={onSelecionarZona} />
      ) : null}

      {rota ? (
        <>
          <Polyline
            coordinates={rota}
            strokeColor="#FFFFFF"
            strokeWidth={5}
            // Junta e ponta arredondadas: sem isso as curvas da rota ficam
            // com "bicos" onde dois segmentos se encontram.
            lineCap="round"
            lineJoin="round"
          />
          {/* Retirada é AZUL com uma pessoa; destino é BRANCO com um quadrado.
              Enquanto a oferta está na tela os dois aparecem juntos, e o
              motorista precisa saber num relance qual é qual para julgar a
              corrida. Dois pinos iguais obrigariam a ler os endereços no sheet
              só para descobrir a direção da viagem. */}
          {paradas.map((parada) => (
            <Marker
              key={parada.tipo}
              coordinate={parada.ponto}
              anchor={{ x: 0.5, y: 0.5 }}
              tracksViewChanges={false}
            >
              {parada.tipo === 'retirada' ? (
                <View style={estilos.pinoRetirada}>
                  <Icone nome="person" tamanho={18} cor="#FFFFFF" />
                </View>
              ) : (
                <View style={estilos.pino}>
                  <View style={[estilos.pinoMiolo, estilos.quadrado]} />
                </View>
              )}
            </Marker>
          ))}
        </>
      ) : null}

      <MarcadorCarro
        coordenada={local ? { latitude: local.latitude, longitude: local.longitude } : null}
        direcao={(local && local.heading) || 0}
        online
      />
    </MapView>
  );
}

const estilos = StyleSheet.create({
  pino: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinoMiolo: { width: 11, height: 11, backgroundColor: cores.fundo },
  quadrado: { borderRadius: 2 },

  // Maior que o pino do destino (38 contra 30) de propósito: é para onde o
  // motorista vai PRIMEIRO, e ganha a borda branca para se destacar tanto do
  // mapa escuro quanto da linha branca da rota que passa por baixo dele.
  pinoRetirada: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: cores.acao,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
