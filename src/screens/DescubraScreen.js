import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Icone from '../components/ui/Icone';
import Tela, { TOPO_SEGURO } from '../components/ui/Tela';
import { cores, espaco, raio } from '../theme/cores';
import { tipo } from '../theme/tipografia';

/**
 * DESCUBRA (§5)
 * =============
 * A aba de oportunidades: promoções, eventos e corridas de aeroporto.
 *
 * ELA NASCE VAZIA, E ISSO É O DESENHO — NÃO UMA PENDÊNCIA
 * ------------------------------------------------------
 * O estado vazio não é um rascunho esperando conteúdo: é o que o motorista vê
 * na maior parte dos dias, porque promoção é evento raro. Uma tela que só foi
 * pensada cheia vira um buraco preto nos outros 90% das aberturas.
 *
 * Por isso o vazio tem os três elementos que um vazio bom precisa ter: um
 * símbolo, uma frase que diz o que aconteceu ("Nada ainda") e uma que diz o
 * que esperar ("verifique de novo em breve..."). Sem a terceira, o usuário não
 * sabe se a tela está quebrada ou se é assim mesmo.
 *
 * OS FILTROS E OS DIAS CONTINUAM VIVOS COM A TELA VAZIA
 * ----------------------------------------------------
 * Chips e dias respondem ao toque mesmo sem nada para listar. É de propósito:
 * o motorista precisa poder VERIFICAR outro dia — e uma tela onde nada reage
 * é indistinguível de uma tela travada.
 *
 * O que eles não fazem é inventar conteúdo. Trocar de dia continua mostrando
 * "Nada ainda", porque o protótipo não simula promoções. Preferimos um vazio
 * honesto a dados falsos que sugerem uma funcionalidade que não existe.
 */

const FILTROS = [
  { chave: 'salvo', rotulo: 'Salvo', icone: 'bookmark_border' },
  { chave: 'promocoes', rotulo: 'Promoções', icone: 'cog_outline' },
  { chave: 'aeroportos', rotulo: 'Aeroportos', icone: 'flight' },
];

const NOMES_DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

/**
 * A semana corrente, de segunda a domingo.
 *
 * Calculada a partir de hoje em vez de fixa no código: uma faixa de datas
 * congelada é o tipo de detalhe que denuncia protótipo na hora — na
 * apresentação, "Qua 19" apareceria numa quinta-feira dia 27.
 *
 * `getDay()` devolve 0 para domingo, e a semana aqui começa na segunda; o
 * `(dia + 6) % 7` faz esse deslocamento sem um `if` para o caso do domingo.
 */
function semanaDeHoje() {
  const hoje = new Date();
  const deslocamento = (hoje.getDay() + 6) % 7;

  return NOMES_DIAS.map((nome, i) => {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() - deslocamento + i);
    return { nome, numero: d.getDate(), ehHoje: i === deslocamento };
  });
}

export default function DescubraScreen() {
  const dias = useMemo(semanaDeHoje, []);
  const [filtro, setFiltro] = useState(null);
  const [diaAtivo, setDiaAtivo] = useState(() => dias.findIndex((d) => d.ehHoje));

  return (
    <Tela>
      <Text style={estilos.titulo} accessibilityRole="header">
        Descubra
      </Text>

      {/* Os chips rolam na horizontal: são três hoje, mas "Aeroportos" já
          encosta na borda em telas de 360 px. Uma linha que corta a última
          palavra é pior que uma que o usuário arrasta. */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        // `flexGrow: 0` no estilo do PRÓPRIO ScrollView, não no do conteúdo.
        // Sem isso ele se espalha na vertical para ocupar todo o espaço livre
        // da coluna — 344 px em vez dos ~62 dos chips — e empurra a faixa de
        // dias para o meio da tela. É o comportamento padrão de um ScrollView
        // sem altura definida, e não tem nada a ver com ele ser horizontal:
        // o eixo do gesto e o eixo do layout são coisas separadas.
        style={estilos.faixaFiltros}
        contentContainerStyle={estilos.filtros}
      >
        {FILTROS.map((f) => {
          const ativo = filtro === f.chave;
          return (
            <Pressable
              key={f.chave}
              onPress={() => setFiltro(ativo ? null : f.chave)}
              accessibilityRole="button"
              accessibilityState={{ selected: ativo }}
              accessibilityLabel={f.rotulo}
              style={({ pressed }) => [
                estilos.chip,
                ativo && estilos.chipAtivo,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Icone
                nome={f.icone}
                tamanho={18}
                cor={ativo ? cores.fundo : cores.texto}
              />
              <Text style={[estilos.chipTexto, ativo && estilos.chipTextoAtivo]}>
                {f.rotulo}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ── Faixa da semana ──────────────────────────────────────────────── */}
      <View style={estilos.semana}>
        {dias.map((d, i) => {
          const ativo = i === diaAtivo;
          return (
            <Pressable
              key={d.nome}
              onPress={() => setDiaAtivo(i)}
              accessibilityRole="button"
              accessibilityState={{ selected: ativo }}
              accessibilityLabel={`${d.nome}, dia ${d.numero}`}
              style={estilos.dia}
            >
              <Text style={[estilos.diaNome, ativo && estilos.diaAtivoTexto]}>{d.nome}</Text>
              <Text style={[estilos.diaNumero, ativo && estilos.diaAtivoTexto]}>{d.numero}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={estilos.divisor} />

      {/* ── Estado vazio ─────────────────────────────────────────────────── */}
      <View style={estilos.vazio}>
        <LosangoDescubra />
        <Text style={estilos.vazioTitulo} accessibilityRole="header">
          Nada ainda
        </Text>
        <Text style={estilos.vazioTexto}>
          Verifique de novo em breve para descobrir oportunidades como eventos,
          tendências, Turbo+ e muito mais.
        </Text>
      </View>
    </Tela>
  );
}

/**
 * O losango da marca Descubra, desenhado com Views.
 *
 * POR QUE NÃO UM SVG
 * ------------------
 * Seria o caminho natural, mas `react-native-svg` não está no projeto, e
 * acrescentar uma dependência NATIVA (que exige rebuild do app e entra na
 * matriz de compatibilidade do Expo) por causa de um único glifo é caro demais
 * pelo que entrega.
 *
 * O truque: um quadrado com borda, girado 45°, vira um losango. Uma linha
 * vertical dentro dele, depois do giro, vira exatamente uma das diagonais —
 * que é o que divide a forma em dois triângulos.
 *
 * `overflow: hidden` no quadrado impede que a linha escape pelas quinas: ela é
 * mais alta que o quadrado de propósito, para encostar nas duas pontas mesmo
 * com a borda ocupando espaço.
 */
function LosangoDescubra() {
  return (
    <View style={estilos.losangoArea} accessibilityElementsHidden importantForAccessibility="no">
      <View style={estilos.losango}>
        <View style={estilos.losangoDiagonal} />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  titulo: {
    ...tipo.h1,
    color: cores.texto,
    paddingHorizontal: espaco.md,
    paddingTop: TOPO_SEGURO + 14,
  },

  faixaFiltros: { flexGrow: 0 },
  filtros: { paddingHorizontal: espaco.md, paddingTop: 18, gap: espaco.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    height: 44,
    paddingHorizontal: 18,
    borderRadius: raio.pill,
    backgroundColor: cores.superficie,
  },
  // Selecionado inverte fundo e texto em vez de só mudar a cor da borda: num
  // fundo quase preto, borda clara e borda um pouco mais clara são a mesma
  // coisa a um braço de distância.
  chipAtivo: { backgroundColor: cores.texto },
  chipTexto: { ...tipo.corpoForte, color: cores.texto },
  chipTextoAtivo: { color: cores.fundo },

  semana: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: espaco.md,
    paddingTop: 20,
    paddingBottom: 12,
  },
  dia: { alignItems: 'center', gap: 2, minWidth: 34 },
  diaNome: { ...tipo.legenda, color: cores.textoTerciario },
  diaNumero: { ...tipo.corpoForte, color: cores.textoTerciario },
  diaAtivoTexto: { color: cores.texto },

  divisor: { height: StyleSheet.hairlineWidth, backgroundColor: cores.borda },

  vazio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: espaco.xl,
    // Sobe o bloco: centralizado no espaço TOTAL ele nasce visualmente baixo,
    // porque a tab bar come 76 px na base que o flex não conhece.
    paddingBottom: 90,
  },
  losangoArea: {
    width: 78,
    height: 78,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espaco.lg,
  },
  losango: {
    width: 50,
    height: 50,
    borderWidth: 2,
    borderColor: cores.texto,
    transform: [{ rotate: '45deg' }],
    overflow: 'hidden',
    alignItems: 'center',
  },
  losangoDiagonal: { width: 2, height: 60, backgroundColor: cores.texto },

  vazioTitulo: { ...tipo.h2, color: cores.texto, textAlign: 'center' },
  vazioTexto: {
    ...tipo.corpo,
    color: cores.textoSecundario,
    textAlign: 'center',
    marginTop: espaco.sm,
    maxWidth: 300,
  },
});
