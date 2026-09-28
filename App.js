import React, { useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import * as SplashScreenNativa from 'expo-splash-screen';
// IMPORTAR PESO A PESO, NÃO DO ÍNDICE DO PACOTE
// ---------------------------------------------
// `from '@expo-google-fonts/inter'` parece mais limpo e custa caro: o
// index.js do pacote faz `require()` das 18 variantes (9 pesos × normal e
// itálico), e o empacotador copia TODAS para o build — 9,6 MB de fontes para
// um app que usa cinco.
//
// Importando de `.../400Regular` cada arquivo entra sozinho. É o mesmo
// princípio de `import { debounce } from 'lodash'` versus `lodash/debounce`:
// o índice de um pacote costuma arrastar o pacote inteiro junto.
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { Inter_800ExtraBold } from '@expo-google-fonts/inter/800ExtraBold';
import { useFonts } from 'expo-font';

import TabBar from './src/components/ui/TabBar';
import Toast from './src/components/ui/Toast';
import { BASE_SEGURA } from './src/components/ui/Tela';
import { AppProvider, useApp } from './src/estado/AppProvider';

import AtivacaoScreen from './src/screens/AtivacaoScreen';
import ContaDadosScreen from './src/screens/ContaDadosScreen';
import ContaScreen from './src/screens/ContaScreen';
import DescubraScreen from './src/screens/DescubraScreen';
import DesignSystemScreen from './src/screens/DesignSystemScreen';
import EditarPerfilScreen from './src/screens/EditarPerfilScreen';
import FicandoOnlineScreen from './src/screens/FicandoOnlineScreen';
import GanhosScreen from './src/screens/GanhosScreen';
import GerenciarVeiculosScreen from './src/screens/GerenciarVeiculosScreen';
import InicioScreen from './src/screens/InicioScreen';
import MapaScreen from './src/screens/MapaScreen';
import MensagensScreen from './src/screens/MensagensScreen';
import MenuScreen from './src/screens/MenuScreen';
import PerfilScreen from './src/screens/PerfilScreen';
import PreferenciasScreen from './src/screens/PreferenciasScreen';
import ResumoScreen from './src/screens/ResumoScreen';
import SemGpsScreen from './src/screens/SemGpsScreen';
import SplashScreen from './src/screens/SplashScreen';
import VerificacaoFacialScreen from './src/screens/VerificacaoFacialScreen';
import VeiculosScreen from './src/screens/VeiculosScreen';

/**
 * PONTO DE ENTRADA DO APP
 * =======================
 *
 * O `AppProvider` guarda o estado global (navegação, máquina de estados da
 * corrida, preferências). O `Raiz` abaixo só decide o que desenhar.
 *
 * Separar os dois importa: o Provider precisa ficar POR FORA de tudo que usa
 * `useApp()`, incluindo a tab bar e o toast. Se ele estivesse dentro do
 * `Raiz`, nenhum deles conseguiria ler o contexto.
 *
 * O CARREGAMENTO DA FONTE
 * -----------------------
 * A Inter vem em arquivos `.ttf` que o app precisa ler ANTES de desenhar
 * qualquer texto. Se você renderizar durante o carregamento, acontece o
 * "flash of unstyled text": a tela aparece na fonte do sistema e, meio
 * segundo depois, todo o layout salta quando a Inter entra — porque as duas
 * fontes têm larguras diferentes.
 *
 * A solução tem duas metades e as duas são necessárias:
 *
 *   1. `preventAutoHideAsync()` segura a splash NATIVA (a do sistema, que
 *      aparece antes do JavaScript rodar) em vez de deixá-la sumir sozinha;
 *   2. só devolvemos a interface quando `fontesCarregadas` vira true, e aí
 *      escondemos a splash no `onLayout` — ou seja, depois do primeiro
 *      desenho de verdade, não antes.
 *
 * Sem o passo 2, a splash sumiria um frame antes do conteúdo existir e o
 * usuário veria um piscar branco.
 */

// Chamado no escopo do módulo, não dentro do componente: precisa acontecer
// antes do primeiro render, e uma vez só.
SplashScreenNativa.preventAutoHideAsync().catch(() => {
  // Em alguns ambientes (web, recarga rápida) a splash já foi embora. Sem drama.
});

export default function App() {
  const [fontesCarregadas, erroFonte] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  // Se a fonte falhar, seguimos com a do sistema em vez de travar o app numa
  // tela vazia para sempre. Um app sem a fonte certa é feio; um app que nunca
  // abre é inútil.
  const pronto = fontesCarregadas || !!erroFonte;

  useEffect(() => {
    if (erroFonte) console.warn('Falha ao carregar a Inter, usando a fonte do sistema:', erroFonte);
  }, [erroFonte]);

  const aoDesenhar = useCallback(() => {
    if (pronto) SplashScreenNativa.hideAsync().catch(() => {});
  }, [pronto]);

  if (!pronto) return null;

  return (
    <View style={estilos.raiz} onLayout={aoDesenhar}>
      <AppProvider>
        <Raiz />
      </AppProvider>
    </View>
  );
}

/**
 * A TABELA DE TELAS
 * -----------------
 * Um objeto, não uma cascata de `if`. Acrescentar uma tela é acrescentar uma
 * linha — e a chave é literalmente o valor que `navegar('conta')` recebe, o
 * que torna impossível navegar para um destino que não existe sem perceber.
 *
 * Quando o app crescer, troque isto por React Navigation: você ganha gesto de
 * voltar, transições nativas e histórico de pilha de graça. O que NÃO muda é a
 * máquina de estados da corrida — ela continua dentro do MapaScreen. Veja a
 * explicação em `src/estado/AppProvider.js`.
 */
const TELAS = {
  splash: SplashScreen,
  ativacao: AtivacaoScreen,
  inicio: InicioScreen,
  descubra: DescubraScreen,
  mensagens: MensagensScreen,
  menu: MenuScreen,
  perfil: PerfilScreen,
  editarPerfil: EditarPerfilScreen,
  conta: ContaScreen,
  contaDados: ContaDadosScreen,
  veiculos: VeiculosScreen,
  gerenciarVeiculos: GerenciarVeiculosScreen,
  ganhos: GanhosScreen,
  preferencias: PreferenciasScreen,
  verificacaoFacial: VerificacaoFacialScreen,
  ficandoOnline: FicandoOnlineScreen,
  mapa: MapaScreen,
  resumo: ResumoScreen,
  semGps: SemGpsScreen,
  designSystem: DesignSystemScreen,
};

/**
 * Telas que mostram a tab bar.
 *
 * No vídeo ela aparece em muito mais lugares do que só nas três abas: Perfil,
 * Conta, Veículos e Conta da Uber também a mantêm. Só o fluxo de direção
 * (ficando online, mapa, resumo) e os formulários de tela cheia a escondem —
 * porque ali o motorista tem uma tarefa só.
 */
const COM_TAB_BAR = [
  'inicio',
  'descubra',
  'mensagens',
  'ganhos',
  'menu',
  'perfil',
  'conta',
  'contaDados',
  'veiculos',
];

function Raiz() {
  const { tela, aba, navegar, toast } = useApp();

  const Atual = TELAS[tela] || InicioScreen;
  const mostrarTabBar = COM_TAB_BAR.indexOf(tela) >= 0;

  /**
   * A tab bar usa `msg` como chave e a tela se chama `mensagens` — o mapa
   * abaixo existe para esse desencontro não virar um `if` espalhado. As cinco
   * abas levam a uma tela de verdade; não há mais o caso "avisa que não
   * existe".
   */
  const TELA_DA_ABA = {
    inicio: 'inicio',
    descubra: 'descubra',
    ganhos: 'ganhos',
    msg: 'mensagens',
    menu: 'menu',
  };

  // Só navegar: o `navegar` já acende a aba certa pelo mapa dele. Marcar a aba
  // aqui TAMBÉM seria uma segunda fonte da mesma verdade — e o dia em que as
  // duas discordassem, a barra apontaria uma tela e o app mostraria outra.
  function aoTrocarAba(chave) {
    navegar(TELA_DA_ABA[chave] || 'inicio');
  }

  return (
    <View style={estilos.raiz}>
      <Atual />

      {mostrarTabBar ? (
        <View style={estilos.tabBar}>
          <TabBar ativa={aba} onSelecionar={aoTrocarAba} alturaBase={BASE_SEGURA} />
        </View>
      ) : null}

      {/* O toast fica por último para desenhar por cima de tudo — inclusive
          dos sheets da corrida e da tab bar. */}
      <Toast mensagem={toast} />
    </View>
  );
}

const estilos = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: '#0B0B0F' },
  tabBar: { position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 40 },
});
