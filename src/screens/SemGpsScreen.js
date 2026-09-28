import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import Botao from '../components/ui/Botao';
import Icone from '../components/ui/Icone';
import Tela from '../components/ui/Tela';
import { useApp } from '../estado/AppProvider';
import { cores } from '../theme/cores';
import { tipo } from '../theme/tipografia';

/**
 * SEM GPS (§5.14, estados de erro)
 * --------------------------------
 * A tela que 90% dos projetos de faculdade esquece — e que, num app de
 * mobilidade, é a mais provável de aparecer no primeiro uso.
 *
 * A ANATOMIA DE UM BOM ESTADO DE ERRO são três coisas, nesta ordem:
 *
 *   1. O QUE ACONTECEU, sem jargão. "Não encontramos sua localização",
 *      não "Error: PERMISSION_DENIED".
 *   2. POR QUE ISSO IMPORTA. Sem GPS não dá para receber viagens perto —
 *      o usuário precisa entender o custo antes de decidir agir.
 *   3. UMA AÇÃO QUE RESOLVE. E ela tem que resolver de verdade:
 *      `Linking.openSettings()` abre a tela de permissões DESTE app, não um
 *      tutorial genérico. Um botão que só fecha o aviso é decoração.
 *
 * A saída secundária ("Tentar mais tarde") existe porque nem todo erro é
 * urgente — e prender o usuário numa tela sem saída é pior que o erro.
 */
export default function SemGpsScreen({ mensagem }) {
  const { navegar } = useApp();

  async function abrirConfiguracoes() {
    try {
      await Linking.openSettings();
    } catch (e) {
      // Alguns ambientes (emulador antigo, web) não implementam openSettings.
      navegar('inicio');
    }
  }

  return (
    <Tela>
      <View style={estilos.centro}>
        <View style={estilos.icone}>
          <Icone nome="location_disabled" tamanho={34} cor={cores.erro} />
        </View>

        <Text style={estilos.titulo} accessibilityRole="header">
          Não encontramos sua localização
        </Text>
        <Text style={estilos.texto}>
          {mensagem ||
            'Ative o GPS e permita o acesso à localização para receber viagens perto de você.'}
        </Text>

        <Botao titulo="Abrir configurações" onPress={abrirConfiguracoes} style={estilos.botao} />
        <Botao
          titulo="Tentar mais tarde"
          variante="texto"
          onPress={() => navegar('inicio')}
          style={estilos.secundario}
        />
      </View>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  icone: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,77,79,0.14)',
    alignItems: 'center', justifyContent: 'center',
  },
  titulo: { ...tipo.h2, color: cores.texto, marginTop: 22, textAlign: 'center' },
  texto: { ...tipo.corpo, color: cores.textoSecundario, marginTop: 8, textAlign: 'center' },
  botao: { alignSelf: 'stretch', marginTop: 26 },
  secundario: { alignSelf: 'stretch', height: 48, marginTop: 8 },
});
