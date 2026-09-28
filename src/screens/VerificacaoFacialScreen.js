import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import Avatar from '../components/ui/Avatar';
import Botao from '../components/ui/Botao';
import Icone from '../components/ui/Icone';
import Tela, { TOPO_SEGURO } from '../components/ui/Tela';
import { useApp } from '../estado/AppProvider';
import * as haptica from '../estado/haptica';
import { claro, cores } from '../theme/cores';
import { tipo } from '../theme/tipografia';
import { DRIVER_NATIVO } from '../theme/animacao';

const CIRCULO = 208;
const ANEL = 6;

/** Quanto tempo a "conferência" leva. No app real é o tempo da rede. */
const MS_CONFERINDO = 2600;

/**
 * VERIFICAÇÃO FACIAL (Módulo 3 do ROADMAP)
 * ========================================
 *
 * ⚠️ ESTA TELA NÃO ESTÁ NO VÍDEO
 * ------------------------------
 * A gravação de referência vai direto de "Ficando online…" para o mapa — não
 * há verificação facial nela. O que foi copiado do vídeo é a LINGUAGEM: fundo
 * claro, anel azul girando, título pesado, subtítulo cinza, X no canto. Ou
 * seja, a mesma tela de "Ficando online" com outro conteúdo — o que também é
 * coerente, porque as duas são o mesmo momento do fluxo: a antessala do turno.
 *
 * POR QUE A FOTO NO LUGAR DA CÂMERA
 * ---------------------------------
 * Num app real, aqui abriria a câmera frontal e o rosto ao vivo seria
 * comparado com a foto cadastrada. Neste protótipo o círculo mostra a FOTO DE
 * PERFIL — a que você escolheu em Editar perfil.
 *
 * A troca é honesta e tem um ganho didático: deixa claro que a verificação
 * compara você com um retrato guardado, sem precisar pedir acesso à câmera
 * numa apresentação. E evita capturar biometria de quem estiver assistindo —
 * dado sensível que um trabalho de faculdade não tem por que coletar.
 *
 * OS TRÊS ESTADOS
 * ---------------
 *   instrucao → conferindo → aprovado
 *
 * É a mesma ideia da máquina de estados da corrida, em escala menor: cada
 * estado tem um desenho e uma saída só. O `aprovado` avança sozinho, porque
 * pedir mais um toque depois de "tudo certo" é atrito sem função.
 */
export default function VerificacaoFacialScreen() {
  const { perfil, navegar, verificacaoAprovada } = useApp();

  const [etapa, setEtapa] = useState('instrucao');

  const giro = useRef(new Animated.Value(0)).current;
  const pulso = useRef(new Animated.Value(0)).current;

  // ── Anel girando enquanto confere ────────────────────────────────────────
  useEffect(() => {
    if (etapa !== 'conferindo') return undefined;
    giro.setValue(0);
    const ciclo = Animated.loop(
      Animated.timing(giro, {
        toValue: 1,
        duration: 1100,
        easing: Easing.linear,
        useNativeDriver: DRIVER_NATIVO,
      })
    );
    ciclo.start();
    return () => ciclo.stop();
  }, [etapa, giro]);

  // ── A conferência termina sozinha ────────────────────────────────────────
  useEffect(() => {
    if (etapa !== 'conferindo') return undefined;
    const t = setTimeout(() => {
      setEtapa('aprovado');
      haptica.confirmar();
    }, MS_CONFERINDO);
    return () => clearTimeout(t);
  }, [etapa]);

  // ── Aprovado: pequeno respiro e segue para o mapa ────────────────────────
  useEffect(() => {
    if (etapa !== 'aprovado') return undefined;

    Animated.spring(pulso, { toValue: 1, friction: 5, useNativeDriver: DRIVER_NATIVO }).start();

    // 1,1 s é tempo de ler "Tudo certo" sem a tela virar uma parada. Menos que
    // isso e o usuário nem registra que foi aprovado; mais, e vira espera.
    const t = setTimeout(verificacaoAprovada, 1100);
    return () => clearTimeout(t);
  }, [etapa, pulso, verificacaoAprovada]);

  const rotacao = giro.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const textos = {
    instrucao: {
      titulo: 'Confirme que é você',
      sub: 'Antes de ficar online, precisamos verificar que é você quem está dirigindo.',
    },
    conferindo: { titulo: 'Conferindo…', sub: 'Isso leva só alguns segundos.' },
    aprovado: {
      titulo: `Tudo certo, ${perfil.nome}`,
      sub: 'Verificação concluída. Preparando o mapa.',
    },
  }[etapa];

  return (
    <Tela tema="claro">
      {/* Toda espera precisa de saída — inclusive as curtas, porque a pessoa
          pode ter tocado por engano no trânsito. */}
      <Pressable
        onPress={() => navegar('inicio')}
        accessibilityRole="button"
        accessibilityLabel="Cancelar verificação e voltar"
        hitSlop={8}
        style={({ pressed }) => [estilos.fechar, pressed && { opacity: 0.6 }]}
      >
        <Icone nome="close" tamanho={22} cor={claro.texto} />
      </Pressable>

      <View style={estilos.centro}>
        <View style={estilos.area}>
          {/* Anel de fundo: o trilho cinza que existe nos três estados. */}
          <View style={estilos.trilho} />

          {/* Anel ativo. Girando, só o arco azul se move — é assim que todo
              spinner circular é feito, sem imagem nenhuma. Aprovado, ele fica
              verde e inteiro. */}
          {etapa === 'conferindo' ? (
            <Animated.View style={[estilos.arco, { transform: [{ rotate: rotacao }] }]} />
          ) : null}

          {etapa === 'aprovado' ? <View style={estilos.anelAprovado} /> : null}

          {/* A foto de perfil no lugar da câmera. Sem foto, o Avatar desenha o
              ícone — estado legítimo, e o fluxo continua funcionando. */}
          <Avatar uri={perfil.foto} tamanho={CIRCULO - ANEL * 2 - 10} style={estilos.foto} />

          {etapa === 'aprovado' ? (
            <Animated.View style={[estilos.selo, { transform: [{ scale: pulso }] }]}>
              <Icone nome="check" tamanho={26} cor="#FFFFFF" />
            </Animated.View>
          ) : null}
        </View>

        <Text style={estilos.titulo} accessibilityRole="header" accessibilityLiveRegion="polite">
          {textos.titulo}
        </Text>
        <Text style={estilos.sub}>{textos.sub}</Text>

        {etapa === 'instrucao' && !perfil.foto ? (
          <Text style={estilos.aviso}>
            Você ainda não tem foto de perfil. Adicione uma em Menu › Perfil › Editar.
          </Text>
        ) : null}
      </View>

      <View style={estilos.rodape}>
        {etapa === 'instrucao' ? (
          <>
            <Botao titulo="Verificar agora" onPress={() => setEtapa('conferindo')} />
            <Botao
              titulo="Agora não"
              variante="texto"
              corTexto={claro.textoSecundario}
              onPress={() => navegar('inicio')}
              style={estilos.secundario}
            />
          </>
        ) : (
          // Os outros estados não têm botão: são automáticos. Um botão
          // desabilitado no lugar só ocuparia espaço prometendo uma ação.
          <Text style={estilos.nota}>
            Sua imagem não sai do aparelho — esta verificação é simulada.
          </Text>
        )}
      </View>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  fechar: {
    position: 'absolute',
    top: TOPO_SEGURO + 10,
    left: 16,
    zIndex: 2,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8E8ED',
    alignItems: 'center',
    justifyContent: 'center',
  },

  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },

  area: { width: CIRCULO, height: CIRCULO, alignItems: 'center', justifyContent: 'center' },

  trilho: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CIRCULO / 2,
    borderWidth: ANEL,
    borderColor: '#E2E2E8',
  },
  arco: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CIRCULO / 2,
    borderWidth: ANEL,
    // Só o topo é opaco: o resto transparente é o que cria o "arco" ao girar.
    borderColor: 'transparent',
    borderTopColor: cores.acao,
  },
  anelAprovado: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CIRCULO / 2,
    borderWidth: ANEL,
    borderColor: claro.positivo,
  },

  foto: { backgroundColor: '#E8E8ED' },

  selo: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: claro.positivo,
    borderWidth: 4,
    borderColor: claro.fundo,
    alignItems: 'center',
    justifyContent: 'center',
  },

  titulo: { ...tipo.h1, fontSize: 24, color: claro.texto, marginTop: 34, textAlign: 'center' },
  sub: { ...tipo.corpo, color: claro.textoSecundario, marginTop: 8, textAlign: 'center' },
  aviso: { ...tipo.legenda, color: '#9A6B12', marginTop: 14, textAlign: 'center' },

  rodape: { paddingHorizontal: 24, paddingBottom: 34, gap: 6 },
  secundario: { height: 48 },
  nota: { ...tipo.legenda, color: claro.textoSecundario, textAlign: 'center', paddingVertical: 16 },
});
