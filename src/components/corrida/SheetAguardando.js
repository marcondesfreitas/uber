import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import SheetBase from './SheetBase';
import Botao from '../ui/Botao';
import { corridaExemplo } from '../../data/mock';
import { claro, cores } from '../../theme/cores';
import { cronometro, familia, tipo } from '../../theme/tipografia';

/**
 * AGUARDANDO O PASSAGEIRO (§5.14)
 * -------------------------------
 * Um cronômetro e um botão. A tela mais simples do fluxo, e a que mais
 * comunica.
 *
 * O CRONÔMETRO CONTA PARA CIMA, não para baixo. Contagem regressiva criaria
 * pressão sobre o motorista ("corre, vai zerar"); contagem crescente informa
 * sem apressar — e é o número que vira dinheiro quando a espera gratuita
 * acaba. A barra fica vermelha ao passar dos 2:00 para marcar essa fronteira.
 *
 * A frase embaixo do botão ("Confirme só quando o passageiro estiver no
 * carro") é uma trava de processo, não gentileza: iniciar a viagem cedo
 * quebra o cálculo da tarifa e é a fraude mais comum nesse tipo de app.
 */
export default function SheetAguardando({ espera, esperaGratis, onIniciar }) {
  const proporcao = Math.min(1, espera / esperaGratis);
  const passouDoGratis = espera > esperaGratis;

  return (
    <SheetBase style={estilos.sheet}>
      <View style={estilos.topo}>
        <View style={{ flex: 1 }}>
          <Text style={estilos.titulo}>Aguardando {corridaExemplo.passageiro.nome}</Text>
          <Text style={estilos.sub}>
            {passouDoGratis
              ? 'Espera gratuita encerrada — o tempo extra é cobrado'
              : `Espera gratuita até ${cronometro(esperaGratis)}`}
          </Text>
        </View>

        <Text
          style={estilos.cronometro}
          accessibilityLabel={`Esperando há ${Math.floor(espera / 60)} minutos e ${espera % 60} segundos`}
        >
          {cronometro(espera)}
        </Text>
      </View>

      <View style={estilos.trilho}>
        <View
          style={[
            estilos.progresso,
            { width: `${proporcao * 100}%`, backgroundColor: passouDoGratis ? cores.erro : cores.acao },
          ]}
        />
      </View>

      <Botao
        titulo="Iniciar viagem"
        variante="escuro"
        icone="arrow_forward"
        onPress={onIniciar}
        style={estilos.botao}
      />
      <Text style={estilos.aviso}>Confirme só quando o passageiro estiver no carro</Text>
    </SheetBase>
  );
}

const estilos = StyleSheet.create({
  sheet: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 26 },

  topo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  titulo: { ...tipo.h3, color: claro.texto },
  sub: { ...tipo.legenda, color: claro.textoSecundario, marginTop: 3 },
  cronometro: { ...tipo.h1, color: claro.texto, fontVariant: ['tabular-nums'] },

  trilho: { height: 6, borderRadius: 3, backgroundColor: '#EDEDF1', overflow: 'hidden', marginTop: 14 },
  progresso: { height: 6, borderRadius: 3 },

  botao: { height: 56, borderRadius: 28, marginTop: 18 },
  aviso: { ...tipo.micro, fontSize: 12, fontFamily: familia.media, color: claro.textoSecundario, textAlign: 'center', marginTop: 10 },
});
