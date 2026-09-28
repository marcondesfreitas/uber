import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { avisosAtivos } from '../data/avisosTecnicos';
import { cores, espaco, fonte, raio } from '../theme/cores';

/**
 * AVISO TÉCNICO
 * -------------
 * Um selo discreto que abre a lista do que, nesta tela, é simulado ou
 * simplificado em relação a um sistema de produção.
 *
 * Decisões de interface que valem para qualquer "informação secundária":
 *
 *  - O selo é PEQUENO e de baixo contraste. Ele não disputa atenção com o mapa;
 *    quem precisa, encontra. Aviso que grita vira ruído e é ignorado.
 *  - O conteúdo mora num <Modal>, não empilhado na tela. Informação de consulta
 *    ocasional não deve ocupar área permanente.
 *  - Cada item responde duas perguntas: "o que foi simplificado aqui?" e
 *    "como se faz de verdade?". A segunda é a que ensina.
 *
 * O <Modal> é um componente nativo do React Native: ele desenha por cima de
 * TUDO, inclusive do mapa (que é uma view nativa). Tentar fazer isso com
 * position:absolute costuma falhar justamente sobre mapas e vídeos.
 */
export default function AvisoTecnico({ contexto = {}, compacto = false }) {
  const [aberto, setAberto] = useState(false);
  const avisos = avisosAtivos(contexto);

  return (
    <>
      <Pressable
        onPress={() => setAberto(true)}
        style={[estilos.selo, compacto && estilos.seloCompacto]}
        accessibilityRole="button"
        accessibilityLabel={`Avisos técnicos: ${avisos.length} itens`}
      >
        <Text style={estilos.seloTexto}>
          ⓘ {compacto ? avisos.length : `Aviso técnico · ${avisos.length}`}
        </Text>
      </Pressable>

      <Modal
        visible={aberto}
        animationType="slide"
        transparent
        onRequestClose={() => setAberto(false)} // botão voltar do Android
      >
        <View style={estilos.fundo}>
          <View style={estilos.folha}>
            <View style={estilos.cabecalho}>
              <View style={{ flex: 1 }}>
                <Text style={estilos.titulo}>Aviso técnico</Text>
                <Text style={estilos.subtitulo}>
                  Projeto acadêmico. O que está simulado ou simplificado nesta tela.
                </Text>
              </View>
              <Pressable onPress={() => setAberto(false)} hitSlop={12} style={estilos.fechar}>
                <Text style={estilos.fecharTexto}>✕</Text>
              </Pressable>
            </View>

            <ScrollView
              style={{ maxHeight: 460 }}
              contentContainerStyle={{ gap: espaco.sm, paddingBottom: espaco.md }}
              showsVerticalScrollIndicator={false}
            >
              {avisos.map((aviso) => (
                <View key={aviso.id} style={estilos.item}>
                  <Text style={estilos.categoria}>{aviso.categoria}</Text>
                  <Text style={estilos.itemTitulo}>{aviso.titulo}</Text>
                  <Text style={estilos.itemTexto}>{aviso.detalhe}</Text>
                  <View style={estilos.blocoReal}>
                    <Text style={estilos.blocoRealRotulo}>Como se faz em produção</Text>
                    <Text style={estilos.itemTexto}>{aviso.real}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <Text style={estilos.rodape}>
              Aplicativo de estudo, sem vínculo com qualquer empresa de mobilidade.
              Nenhum dado é enviado para fora do aparelho.
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

const estilos = StyleSheet.create({
  selo: {
    backgroundColor: 'rgba(11,11,15,0.7)',
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio.redondo,
    paddingVertical: 5,
    paddingHorizontal: espaco.sm,
  },
  seloCompacto: { paddingHorizontal: 9 },
  seloTexto: { ...fonte.legenda, color: cores.textoSecundario, fontSize: 11 },

  fundo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  folha: {
    backgroundColor: cores.superficie,
    borderTopLeftRadius: raio.lg,
    borderTopRightRadius: raio.lg,
    borderTopWidth: 1,
    borderColor: cores.borda,
    padding: espaco.lg,
    gap: espaco.md,
  },
  cabecalho: { flexDirection: 'row', alignItems: 'flex-start', gap: espaco.sm },
  titulo: { ...fonte.titulo, color: cores.texto },
  subtitulo: { ...fonte.corpo, color: cores.textoSecundario, marginTop: 2 },
  fechar: { padding: espaco.xs },
  fecharTexto: { color: cores.textoSecundario, fontSize: 18 },

  item: {
    backgroundColor: cores.superficieAlta,
    borderRadius: raio.md,
    padding: espaco.md,
    gap: espaco.xs,
  },
  categoria: {
    ...fonte.legenda,
    color: cores.alerta,
    textTransform: 'uppercase',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  itemTitulo: { ...fonte.subtitulo, color: cores.texto },
  itemTexto: { ...fonte.corpo, color: cores.textoSecundario, lineHeight: 20 },
  blocoReal: {
    marginTop: espaco.xs,
    paddingTop: espaco.sm,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
    gap: 2,
  },
  blocoRealRotulo: { ...fonte.legenda, color: cores.online, fontSize: 11 },

  rodape: {
    ...fonte.legenda,
    color: cores.offline,
    textAlign: 'center',
    lineHeight: 16,
  },
});
