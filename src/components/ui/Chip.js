import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icone from './Icone';
import { claro, cores, raio } from '../../theme/cores';
import { tipo } from '../../theme/tipografia';

/**
 * CHIP (§3) — pill de 32 px com ícone opcional
 * --------------------------------------------
 * Usado no sheet da solicitação para os fatos rápidos sobre a corrida:
 * nota do passageiro, selo de verificado, bônus incluído.
 *
 * Por que chip e não uma lista: no momento em que a solicitação aparece, o
 * motorista tem ~12 segundos e está com o carro em movimento. Chips são
 * escaneáveis em paralelo; uma lista obriga a leitura sequencial.
 *
 * Acessibilidade (§9): a cor NUNCA é o único sinal. O chip verde de
 * "Verificado" tem o texto "Verificado" — não é só um selo colorido.
 */
export default function Chip({ texto, icone, tom = 'neutro', escuro = false }) {
  const t = (escuro ? TONS_ESCURO : TONS_CLARO)[tom] || TONS_CLARO.neutro;

  return (
    <View style={[estilos.chip, { backgroundColor: t.fundo }]}>
      {icone ? <Icone nome={icone} tamanho={15} cor={t.texto} /> : null}
      <Text style={[estilos.texto, { color: t.texto }]}>{texto}</Text>
    </View>
  );
}

const TONS_CLARO = {
  neutro: { fundo: claro.superficieAlta, texto: claro.texto },
  positivo: { fundo: 'rgba(31,214,95,0.14)', texto: claro.positivo },
  bonus: { fundo: 'rgba(123,47,190,0.12)', texto: cores.bonus },
};

const TONS_ESCURO = {
  neutro: { fundo: cores.superficieAlta, texto: cores.texto },
  positivo: { fundo: 'rgba(31,214,95,0.16)', texto: cores.online },
  bonus: { fundo: cores.bonus, texto: '#FFFFFF' },
};

const estilos = StyleSheet.create({
  chip: {
    height: 32,
    paddingHorizontal: 11,
    borderRadius: raio.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  texto: { ...tipo.micro, fontSize: 12 },
});
