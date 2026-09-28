import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Botao from '../components/ui/Botao';
import Icone from '../components/ui/Icone';
import Tela, { TOPO_SEGURO } from '../components/ui/Tela';
import { useApp } from '../estado/AppProvider';
import { corridaExemplo } from '../data/mock';
import { claro } from '../theme/cores';
import { brl, familia, km, tipo } from '../theme/tipografia';

/**
 * RESUMO DA CORRIDA (§5.14)
 * -------------------------
 * Tela CLARA, como a de "Ficando online…". As duas marcam fronteiras do turno:
 * uma abre o momento operacional, a outra fecha um ciclo dele.
 *
 * A ORDEM DOS BLOCOS É A ORDEM DAS PERGUNTAS:
 *   quanto ganhei → de onde veio → como foi o passageiro → teve gorjeta
 *
 * A AVALIAÇÃO COMEÇA EM 5 ESTRELAS, não em zero. Isso é uma decisão de produto
 * com consequência real: a nota padrão é a que a maioria envia, e o padrão
 * neutro/positivo evita punir passageiros por inércia. Vale saber que a
 * escolha tem o efeito colateral de comprimir as notas para cima — é o motivo
 * de sistemas de reputação assim viverem com médias entre 4,7 e 5,0.
 *
 * A gorjeta aparece DEPOIS da avaliação de propósito: mostrá-la antes
 * transformaria a nota numa resposta ao dinheiro.
 */
export default function ResumoScreen() {
  const { nota, setNota, voltarAoMapa, ficarOffline } = useApp();
  const c = corridaExemplo;

  return (
    <Tela tema="claro">
      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
        <Text style={estilos.rotulo}>Viagem finalizada</Text>
        <Text style={estilos.valor}>{brl(c.valor)}</Text>

        <View style={estilos.metricas}>
          <Metrica rotulo="Distância" valor={km(3.8)} />
          <Metrica rotulo="Duração" valor={`${c.duracaoMin} min`} />
          <Metrica rotulo="Bônus" valor={`+${c.bonus.toFixed(2).replace('.', ',')}`} positivo />
        </View>

        <View style={estilos.card}>
          <Text style={estilos.tituloCard}>
            Como foi a viagem com {c.passageiro.nome.split(' ')[0]}?
          </Text>

          <View style={estilos.estrelas} accessibilityRole="adjustable">
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable
                key={n}
                onPress={() => setNota(n)}
                accessibilityRole="button"
                accessibilityLabel={`Dar ${n} ${n === 1 ? 'estrela' : 'estrelas'}`}
                accessibilityState={{ selected: n === nota }}
                hitSlop={6}
              >
                <Icone nome="star" tamanho={32} cor={n <= nota ? '#FFB020' : '#C4C4CC'} />
              </Pressable>
            ))}
          </View>

          {/* O texto confirma a nota por PALAVRA, não só pelo preenchimento das
              estrelas. A cor nunca é o único sinal (§9). */}
          <Text style={estilos.notaTexto}>
            Você avaliou {nota} {nota === 1 ? 'estrela' : 'estrelas'}
          </Text>
        </View>

        <View style={[estilos.card, estilos.cardGorjeta]}>
          <View style={{ flex: 1 }}>
            <Text style={estilos.tituloCard}>Gorjeta</Text>
            <Text style={estilos.descCard}>O passageiro adicionou uma gorjeta</Text>
          </View>
          <Text style={estilos.gorjeta}>{brl(c.gorjeta)}</Text>
        </View>
      </ScrollView>

      <View style={estilos.rodape}>
        <Botao titulo="Voltar a procurar viagens" onPress={voltarAoMapa} />
        <Botao
          titulo="Ficar offline"
          variante="texto"
          corTexto={claro.texto}
          onPress={ficarOffline}
          style={estilos.offline}
        />
      </View>
    </Tela>
  );
}

function Metrica({ rotulo, valor, positivo }) {
  return (
    <View style={estilos.metrica} accessibilityLabel={`${rotulo}: ${valor}`}>
      <Text style={estilos.metricaRotulo}>{rotulo}</Text>
      <Text style={[estilos.metricaValor, positivo && { color: claro.positivo }]}>{valor}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  conteudo: { paddingTop: TOPO_SEGURO + 24, paddingHorizontal: 20, paddingBottom: 24 },

  rotulo: { ...tipo.secao, color: claro.textoSecundario },
  valor: { fontSize: 40, lineHeight: 46, fontFamily: familia.extra, color: claro.texto, marginTop: 8, letterSpacing: -1.2, fontVariant: ['tabular-nums'] },

  metricas: { flexDirection: 'row', gap: 10, marginTop: 20 },
  metrica: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: claro.superficie },
  metricaRotulo: { ...tipo.micro, color: claro.textoSecundario },
  metricaValor: { fontSize: 18, fontFamily: familia.bold, color: claro.texto, marginTop: 3 },

  card: { marginTop: 16, padding: 18, borderRadius: 14, backgroundColor: claro.superficie },
  cardGorjeta: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  tituloCard: { ...tipo.corpoForte, fontFamily: familia.bold, color: claro.texto },
  descCard: { ...tipo.legenda, color: claro.textoSecundario, marginTop: 2 },
  gorjeta: { ...tipo.h2, fontFamily: familia.extra, color: claro.positivo, fontVariant: ['tabular-nums'] },

  estrelas: { flexDirection: 'row', gap: 8, marginTop: 14 },
  notaTexto: { ...tipo.legenda, color: claro.textoSecundario, marginTop: 12 },

  rodape: { paddingHorizontal: 20, paddingBottom: 30, gap: 10 },
  offline: { height: 48 },
});
