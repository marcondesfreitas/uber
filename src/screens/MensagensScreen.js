import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icone from '../components/ui/Icone';
import Tela, { TOPO_SEGURO } from '../components/ui/Tela';
import { useApp } from '../estado/AppProvider';
import { cores, espaco, raio } from '../theme/cores';
import { tipo } from '../theme/tipografia';

/**
 * MENSAGENS — CAIXA DE ENTRADA (§5)
 * =================================
 * Duas abas internas: avisos automáticos do app (Notificações) e conversas com
 * gente de verdade (Suporte).
 *
 * POR QUE AS DUAS NÃO PODEM VIRAR UMA LISTA SÓ
 * --------------------------------------------
 * Parecem a mesma coisa — texto que chega de fora — mas o motorista as procura
 * por motivos opostos. Notificação é conteúdo empurrado: promoção, aviso de
 * política, resumo da semana. Suporte é uma conversa que ELE abriu e está
 * esperando resposta.
 *
 * Misturadas numa lista só, a resposta do suporte que ele espera há dois dias
 * afunda sob quatro avisos de promoção. Separar é o que garante que o item
 * urgente esteja sempre a um toque, sem rolagem.
 *
 * AS ABAS SÃO INTERNAS, NÃO NAVEGAÇÃO
 * -----------------------------------
 * Trocar entre Notificações e Suporte não muda de tela: é a mesma caixa vista
 * por dois recortes. Por isso são abas com sublinhado, e não itens da tab bar
 * de baixo nem telas empilhadas — o botão "voltar" do sistema não deveria
 * desfazer a troca de recorte.
 *
 * O VAZIO É DIFERENTE EM CADA ABA
 * -------------------------------
 * De propósito. Um texto genérico ("nada aqui") nas duas faria o motorista
 * duvidar de que a troca funcionou. Copy diferente é a confirmação de que ele
 * está mesmo olhando outro recorte.
 */

const ABAS = [
  { chave: 'notificacoes', rotulo: 'Notificações' },
  { chave: 'suporte', rotulo: 'Suporte' },
];

const VAZIOS = {
  notificacoes: {
    emoji: '📫',
    titulo: 'Sem novas mensagens.',
    texto: 'As novas notificações aparecerão aqui.',
  },
  suporte: {
    emoji: '💬',
    titulo: 'Nenhuma conversa aberta.',
    texto: 'Quando você falar com o suporte, o histórico fica guardado aqui.',
  },
};

export default function MensagensScreen() {
  const { mostrarToast } = useApp();
  const [aba, setAba] = useState('notificacoes');
  const vazio = VAZIOS[aba];

  return (
    <Tela>
      {/* O arquivo mora ACIMA do título, encostado à direita: é uma ação sobre
          a caixa inteira, não sobre a aba selecionada. Pôr na linha do título
          o faria competir com ele pela mesma leitura. */}
      <View style={estilos.topo}>
        <Pressable
          onPress={() => mostrarToast('Nenhuma mensagem para arquivar')}
          accessibilityRole="button"
          accessibilityLabel="Mensagens arquivadas"
          hitSlop={10}
          style={({ pressed }) => [estilos.botaoArquivo, pressed && { opacity: 0.6 }]}
        >
          <Icone nome="archive_arrow_down_outline" tamanho={24} cor={cores.texto} />
        </Pressable>
      </View>

      <Text style={estilos.titulo} accessibilityRole="header">
        Caixa de entrada
      </Text>

      {/* ── Abas internas ────────────────────────────────────────────────── */}
      <View style={estilos.abas}>
        {ABAS.map((a) => {
          const ativa = aba === a.chave;
          return (
            <Pressable
              key={a.chave}
              onPress={() => setAba(a.chave)}
              accessibilityRole="tab"
              accessibilityState={{ selected: ativa }}
              style={estilos.aba}
            >
              <Text style={[estilos.abaTexto, ativa && estilos.abaTextoAtiva]}>
                {a.rotulo}
              </Text>
              {/* O sublinhado ocupa a metade inteira da largura, não só o
                  texto: é o que faz as duas abas dividirem a barra ao meio e
                  o indicador ter para onde deslizar. */}
              <View style={[estilos.sublinhado, ativa && estilos.sublinhadoAtivo]} />
            </Pressable>
          );
        })}
      </View>

      {/* ── Estado vazio ─────────────────────────────────────────────────── */}
      <View style={estilos.vazio}>
        {/* Disco claro atrás do emoji: sem ele, um emoji colorido solto num
            fundo quase preto parece sujeira na tela em vez de ilustração. */}
        <View style={estilos.disco}>
          <Text style={estilos.emoji}>{vazio.emoji}</Text>
        </View>
        <Text style={estilos.vazioTitulo} accessibilityRole="header">
          {vazio.titulo}
        </Text>
        <Text style={estilos.vazioTexto}>{vazio.texto}</Text>
      </View>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  topo: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: espaco.md,
    paddingTop: TOPO_SEGURO + 6,
  },
  botaoArquivo: { padding: 4 },

  titulo: {
    ...tipo.h1,
    color: cores.texto,
    paddingHorizontal: espaco.md,
    paddingTop: espaco.sm,
  },

  abas: { flexDirection: 'row', marginTop: 22 },
  aba: { flex: 1, alignItems: 'center' },
  abaTexto: { ...tipo.corpoForte, color: cores.textoSecundario, paddingBottom: 12 },
  abaTextoAtiva: { color: cores.texto },
  // A trilha inativa fica visível (borda) para a barra existir como objeto
  // inteiro; sem ela o indicador pareceria um risco solto sob uma palavra.
  sublinhado: { height: 2, width: '100%', backgroundColor: cores.borda },
  sublinhadoAtivo: { backgroundColor: cores.texto },

  vazio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: espaco.xl,
    paddingBottom: 90,
  },
  disco: {
    width: 72,
    height: 72,
    borderRadius: raio.redondo,
    backgroundColor: '#EDEDF2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espaco.lg,
  },
  emoji: { fontSize: 34, lineHeight: 42 },

  vazioTitulo: { ...tipo.h2, color: cores.texto, textAlign: 'center' },
  vazioTexto: {
    ...tipo.corpo,
    color: cores.textoSecundario,
    textAlign: 'center',
    marginTop: espaco.sm,
    maxWidth: 300,
  },
});
