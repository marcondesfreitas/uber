import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Alternador from '../components/ui/Alternador';
import AppBar from '../components/ui/AppBar';
import CardSelecao from '../components/ui/CardSelecao';
import Icone from '../components/ui/Icone';
import Pressionavel from '../components/ui/Pressionavel';
import Tela, { TOPO_SEGURO } from '../components/ui/Tela';
import { useApp } from '../estado/AppProvider';
import { filtrosViagem, tiposServico } from '../data/mock';
import * as haptica from '../estado/haptica';
import { cores, espaco, raio } from '../theme/cores';
import { tipo } from '../theme/tipografia';

/**
 * PREFERÊNCIAS (§5.10)
 * --------------------
 * Duas seções com naturezas diferentes, e o layout precisa deixar isso óbvio:
 *
 *   OPÇÕES  = o que eu aceito receber (cards, escolha múltipla)
 *   FILTROS = como eu quero receber (toggles, lista)
 *
 * O aviso amarelo no topo é o texto mais importante da tela. Filtrar viagens
 * REDUZ quantas ofertas chegam — e o motorista que ligou três filtros e ficou
 * uma hora sem corrida vai culpar o app, não a própria configuração. Dizer
 * isso antes é a diferença entre um recurso e uma reclamação.
 *
 * O badge "↗ Demanda" nos cards de Viagens e UberX conecta esta tela ao
 * simulador do Módulo 1.5: são os tipos com demanda alta agora.
 *
 * A TELA MUDA COM O VEÍCULO ATIVO
 * -------------------------------
 * Carro e moto têm catálogos diferentes — UberX e Uber Envios de um lado,
 * Uber Moto e Uber Flash do outro — e a moto ganha um filtro a mais ("Trocas
 * de viagens"). Nada disso é decidido aqui: a tela lê `veiculoAtivo` e desenha
 * o que corresponde.
 *
 * O estado do que é aceito também é separado por veículo. Sem isso, ligar
 * "Entregas" (o único tipo presente nos dois catálogos) no carro ligaria
 * Entregas na moto junto — e são decisões diferentes.
 */
export default function PreferenciasScreen() {
  const {
    voltarDePreferencias,
    veiculoAtivo,
    tiposAceitos,
    setTiposAceitos,
    filtros,
    setFiltros,
    mostrarToast,
  } = useApp();

  // Esta tela não tem seletor de veículo: ela mostra o catálogo de QUEM ESTÁ
  // ATIVO, escolhido em Gerenciar veículos. Um seletor aqui seria um segundo
  // lugar para decidir a mesma coisa — e o motorista poderia sair daqui com
  // preferências de moto e o carro registrado como ativo.
  const tipos = tiposServico[veiculoAtivo] || tiposServico.carro;
  const filtrosDoVeiculo = filtrosViagem[veiculoAtivo] || filtrosViagem.carro;
  const aceitos = tiposAceitos[veiculoAtivo] || {};

  function alternarTipo(nome) {
    haptica.leve();
    setTiposAceitos((t) => ({
      ...t,
      [veiculoAtivo]: { ...t[veiculoAtivo], [nome]: !t[veiculoAtivo][nome] },
    }));
  }

  function alternarFiltro(chave) {
    haptica.leve();
    setFiltros((f) => ({ ...f, [chave]: !f[chave] }));
  }

  return (
    <Tela>
      <AppBar titulo="Preferências" onVoltar={voltarDePreferencias} alturaTopo={TOPO_SEGURO} />

      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
        <View style={estilos.aviso}>
          <Text style={estilos.avisoTexto}>Filtrar viagens com base nas preferências</Text>
        </View>

        <View style={estilos.linhaSecao}>
          <Text style={estilos.secao}>Opções</Text>
          <Pressionavel
            onPress={() => mostrarToast('Como as preferências afetam suas ofertas: em breve')}
            accessibilityLabel="Saiba mais sobre preferências"
            style={estilos.saibaMais}
          >
            <Text style={estilos.saibaMaisTexto}>Saiba mais</Text>
          </Pressionavel>
        </View>

        <View style={estilos.grade}>
          {tipos.map((t) => (
            <View key={t.nome} style={estilos.metade}>
              <CardSelecao
                nome={t.nome}
                icone={t.icone}
                forma="checkbox"
                badge={t.demanda ? 'Demanda' : null}
                selecionado={!!aceitos[t.nome]}
                onPress={() => alternarTipo(t.nome)}
              />
            </View>
          ))}
        </View>

        <Text style={[estilos.secao, { marginTop: 28 }]}>Filtros da viagem</Text>

        <View style={estilos.filtros}>
          {filtrosDoVeiculo.map((f) => (
            <View key={f.chave} style={estilos.filtro}>
              {/* O ícone à esquerda não é decoração: numa lista de toggles
                  todos os itens têm a mesma forma, e o ícone é a única pista
                  que deixa achar "aceitar dinheiro" sem ler linha por linha. */}
              <Icone nome={f.icone} tamanho={22} cor={cores.texto} style={estilos.filtroIcone} />

              <View style={estilos.filtroTexto}>
                <Text style={estilos.filtroLabel}>{f.label}</Text>
                {f.sub ? <Text style={estilos.filtroSub}>{f.sub}</Text> : null}
              </View>
              <Alternador
                ligado={!!filtros[f.chave]}
                onAlternar={() => alternarFiltro(f.chave)}
                rotulo={f.label}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  conteudo: { paddingHorizontal: espaco.md, paddingTop: 4, paddingBottom: 48 },

  aviso: {
    paddingVertical: 15, paddingHorizontal: 16, borderRadius: 10,
    backgroundColor: 'rgba(120,63,4,0.55)',
  },
  avisoTexto: { ...tipo.corpo, color: '#F0C88A' },

  linhaSecao: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24 },
  secao: { ...tipo.h2, color: cores.texto },
  saibaMais: {
    height: 32, paddingHorizontal: 14, borderRadius: 16,
    backgroundColor: cores.superficieAlta, alignItems: 'center', justifyContent: 'center',
  },
  saibaMaisTexto: { ...tipo.micro, fontSize: 12, color: cores.texto },

  // `flexWrap` + metade de 50% em vez de grid: o React Native não tem
  // CSS Grid, e duas colunas fixas com wrap é o equivalente mais simples.
  grade: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 14, marginHorizontal: -6 },
  metade: { width: '50%', paddingHorizontal: 6, paddingBottom: 12, flexDirection: 'row' },

  filtros: { marginTop: 8 },
  filtro: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: cores.superficie,
  },
  filtroIcone: { marginTop: 2 },
  filtroTexto: { flex: 1, minWidth: 0 },
  filtroLabel: { ...tipo.corpoForte, color: cores.texto },
  filtroSub: { ...tipo.legenda, color: cores.textoSecundario, marginTop: 3 },
});
