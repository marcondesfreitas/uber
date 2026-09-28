import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import BarrasSemana from '../components/BarrasSemana';
import Botao from '../components/ui/Botao';
import Icone from '../components/ui/Icone';
import Tela, { TOPO_SEGURO } from '../components/ui/Tela';
import { useApp } from '../estado/AppProvider';
import { semana } from '../data/mock';
import { cores, espaco, raio } from '../theme/cores';
import { brl, familia, tipo } from '../theme/tipografia';

/**
 * GANHOS (§5.9)
 * -------------
 * Card da semana com valor, gráfico e três métricas.
 *
 * O botão "Mais informações" alterna entre a semana VAZIA e uma semana com
 * dados de exemplo. Ele existe por um motivo prático de desenvolvimento: o
 * estado vazio é o que 100% dos usuários novos veem e o que 0% dos protótipos
 * mostra. Poder ver os dois lado a lado, com um toque, evita descobrir só na
 * apresentação que o gráfico cheio quebra o layout.
 *
 * As três métricas (horas, viagens, pontos) ficam numa linha e não num card
 * cada. São números de contexto: quem olha ganhos quer o VALOR — o resto é
 * para entender de onde ele veio.
 */
export default function GanhosScreen() {
  const { navegar, semanaComDados, setSemanaComDados, mostrarToast } = useApp();

  const dados = semanaComDados ? semana.comDados : semana.vazia;

  function alternar() {
    setSemanaComDados((v) => !v);
    mostrarToast(semanaComDados ? 'Semana sem dados' : 'Semana com dados (Módulo 4)');
  }

  return (
    <Tela>
      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
        <View style={estilos.linhaAjuda}>
          <Pressable
            onPress={() => mostrarToast('Central de ajuda: em breve')}
            accessibilityRole="button"
            style={({ pressed }) => [estilos.ajuda, pressed && { opacity: 0.6 }]}
          >
            <Icone nome="help" tamanho={18} cor={cores.acao} />
            <Text style={estilos.ajudaTexto}>Ajuda</Text>
          </Pressable>
        </View>

        <Text style={estilos.titulo}>Ganhos</Text>

        <View style={estilos.card}>
          <View style={estilos.topoCard}>
            <View style={{ flex: 1 }}>
              <Text style={estilos.periodo}>{semana.periodo}</Text>
              <Text style={estilos.valor}>{brl(dados.valor)}</Text>
            </View>
            <BarrasSemana comDados={semanaComDados} />
          </View>

          <View style={estilos.metricas}>
            <Metrica icone="schedule" valor={`${dados.horas} h`} rotulo="online" />
            <Metrica icone="directions_car" valor={String(dados.viagens)} rotulo="viagens" />
            <Metrica icone="military_tech" valor={String(dados.pontos)} rotulo="pontos" />
          </View>

          <Botao
            titulo="Mais informações"
            variante="fantasma"
            onPress={alternar}
            style={estilos.botaoCard}
          />
        </View>

        <View style={estilos.card}>
          <View style={estilos.linhaTitulo}>
            <Icone nome="account_balance_wallet" tamanho={20} cor={cores.online} />
            <Text style={estilos.tituloCard}>Carteira</Text>
          </View>
          <Text style={estilos.subCard}>Conta</Text>
          <Text style={estilos.descCard}>
            Você recebe um repasse automático após cada viagem
          </Text>
          <Botao
            titulo="Ver detalhes"
            variante="fantasma"
            onPress={() => navegar('conta')}
            style={estilos.botaoCard}
          />
        </View>
      </ScrollView>
    </Tela>
  );
}

function Metrica({ icone, valor, rotulo }) {
  return (
    <View style={estilos.metrica} accessibilityLabel={`${valor} ${rotulo}`}>
      <Icone nome={icone} tamanho={19} cor={cores.textoSecundario} />
      <Text style={estilos.metricaValor}>{valor}</Text>
      <Text style={estilos.metricaRotulo}>{rotulo}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  conteudo: { paddingTop: TOPO_SEGURO + 10, paddingBottom: 110 },

  linhaAjuda: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: espaco.md },
  ajuda: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 4 },
  ajudaTexto: { ...tipo.legenda, fontSize: 14, fontFamily: familia.semi, color: cores.acao },

  titulo: { ...tipo.h1, color: cores.texto, paddingHorizontal: espaco.md, paddingTop: 8 },

  card: {
    margin: espaco.md, marginBottom: 0, marginTop: 14, padding: espaco.md,
    borderRadius: raio.md, backgroundColor: cores.superficie,
    borderWidth: 1, borderColor: cores.borda,
  },
  topoCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  periodo: { ...tipo.legenda, color: cores.textoSecundario },
  valor: { ...tipo.h1, color: cores.texto, marginTop: 6, fontVariant: ['tabular-nums'] },

  metricas: { flexDirection: 'row', gap: 8, marginTop: 20 },
  metrica: { flex: 1, gap: 4 },
  metricaValor: { ...tipo.h3, color: cores.texto, fontVariant: ['tabular-nums'] },
  metricaRotulo: { ...tipo.micro, color: cores.textoTerciario },

  botaoCard: { height: 44, borderRadius: 22, marginTop: 16 },

  linhaTitulo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tituloCard: { ...tipo.h3, color: cores.texto },
  subCard: { ...tipo.corpoForte, color: cores.texto, marginTop: 12 },
  descCard: { ...tipo.legenda, color: cores.textoSecundario, marginTop: 4 },
});
