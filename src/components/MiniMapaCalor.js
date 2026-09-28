import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icone from './ui/Icone';
import SuperficieMapa from './SuperficieMapa';
import { cores, raio } from '../theme/cores';
import { tipo } from '../theme/tipografia';

/**
 * MINI-MAPA DA INÍCIO (§5.2)
 * ==========================
 * A prévia do mapa que aparece na tela inicial, antes de ficar online.
 *
 * É O MESMO MAPA DA TELA DE DIREÇÃO
 * ---------------------------------
 * A primeira versão desenhava uma grade estilizada aqui — mais barata, mas uma
 * mentira: o motorista via um mapa de mentira na Início e um de verdade depois
 * de ficar online, com cores e formas diferentes. Duas visualizações do MESMO
 * dado que não se parecem é o tipo de incoerência que faz o usuário desconfiar
 * dos dois.
 *
 * Agora as duas telas montam o `<SuperficieMapa>` — as mesmas ruas, as mesmas
 * manchas de calor, o mesmo puck. E, de quebra, sobrou UMA implementação de
 * mapa por plataforma para manter, em vez de duas.
 *
 * O MODO ESTÁTICO NÃO É SÓ ECONOMIA
 * ---------------------------------
 * A prévia vai com `estatico`, que desliga arrastar e dar zoom. Isso resolve
 * um conflito real de gestos: um mapa que aceita arrasto DENTRO de uma tela
 * que rola sequestra o dedo — a pessoa tenta rolar a página, o mapa se move, e
 * a tela parece travada. Prévia se toca, não se navega; o toque leva ao mapa
 * inteiro, onde os gestos fazem sentido.
 */
export default function MiniMapaCalor({ zonas = [], local, onExpandir, onBuscar }) {
  return (
    <View style={estilos.caixa}>
      <SuperficieMapa
        local={local}
        zonas={zonas}
        mostrarDemanda
        rota={null}
        seguindo={false}
        dirigindo={false}
        estatico
      />

      {/* O toque em qualquer lugar do mapa abre a tela cheia. Fica ABAIXO dos
          botões de canto na ordem de empilhamento, então eles continuam
          clicáveis por cima dele. */}
      <Pressable
        onPress={onExpandir}
        accessibilityRole="button"
        accessibilityLabel="Abrir o mapa e ficar online"
        style={StyleSheet.absoluteFill}
      />

      <BotaoCanto icone="open_in_full" rotulo="Abrir o mapa" onPress={onExpandir} style={{ top: 12, left: 12 }} />
      <BotaoCanto icone="search" rotulo="Buscar no mapa" onPress={onBuscar} style={{ top: 12, right: 12 }} />

      {/* Badges de bônus. São valores fixos: na Início eles ilustram o
          conceito. Os números que reagem à simulação ficam no mapa cheio. */}
      <View style={[estilos.badge, { top: '62%', left: '16%' }]}>
        <Text style={estilos.badgeTexto}>+R$ 15</Text>
      </View>
      <View style={[estilos.badge, { top: '78%', left: '56%' }]}>
        <Text style={estilos.badgeTexto}>+R$ 9</Text>
      </View>
    </View>
  );
}

function BotaoCanto({ icone, rotulo, onPress, style }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      hitSlop={6}
      style={({ pressed }) => [estilos.botaoCanto, style, pressed && { opacity: 0.7 }]}
    >
      <Icone nome={icone} tamanho={19} cor={cores.texto} />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  caixa: {
    height: 250,
    borderRadius: raio.md,
    // `overflow: hidden` é o que faz o mapa respeitar o canto arredondado.
    // Sem ele o Leaflet/MapView desenha por cima da borda e o card fica
    // quadrado — um dos poucos lugares onde borderRadius não basta sozinho.
    overflow: 'hidden',
    backgroundColor: '#101118',
  },
  botaoCanto: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: raio.campo,
    backgroundColor: 'rgba(11,11,15,0.78)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 14,
    backgroundColor: cores.bonus,
  },
  badgeTexto: { ...tipo.micro, color: '#FFFFFF' },
});
