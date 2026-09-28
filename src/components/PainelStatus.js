import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { cores, espaco, fonte, raio } from '../theme/cores';

/**
 * PAINEL SUPERIOR
 * ---------------
 * Mostra o estado do motorista e dados vindos do GPS.
 * Repare que ele NÃO tem lógica: só recebe props e desenha. Componentes assim
 * ("burros"/apresentacionais) são fáceis de testar e reaproveitar.
 */
export default function PainelStatus({ online, velocidadeKmh, precisao }) {
  return (
    <View style={estilos.caixa}>
      <View style={estilos.linha}>
        <View style={[estilos.bolinha, { backgroundColor: online ? cores.online : cores.offline }]} />
        <Text style={estilos.titulo}>{online ? 'Procurando corridas' : 'Você está offline'}</Text>
      </View>

      <View style={estilos.linhaDados}>
        <Dado rotulo="Velocidade" valor={`${velocidadeKmh} km/h`} />
        <Dado rotulo="Precisão GPS" valor={precisao ? `${Math.round(precisao)} m` : '—'} />
      </View>
    </View>
  );
}

function Dado({ rotulo, valor }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <Text style={estilos.valor}>{valor}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: {
    backgroundColor: cores.vidro,
    borderRadius: raio.md,
    padding: espaco.md,
    borderWidth: 1,
    borderColor: cores.borda,
    gap: espaco.sm,
  },
  linha: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
  linhaDados: { flexDirection: 'row', marginTop: espaco.xs },
  bolinha: { width: 10, height: 10, borderRadius: raio.redondo },
  titulo: { ...fonte.subtitulo, color: cores.texto },
  rotulo: { ...fonte.legenda, color: cores.textoSecundario },
  valor: { ...fonte.subtitulo, color: cores.texto },
});
