import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Botao from './Botao';
import { reduzirParaDataUrl } from '../../services/fotoPerfil';

/**
 * SELETOR DE FOTO — versão WEB
 * ============================
 * Um botão que abre a caixa de arquivos do navegador. Mesma interface do
 * `SeletorFoto.js` (nativo); o Metro escolhe este arquivo pelo sufixo `.web`.
 *
 * O TRUQUE: O CLIQUE NÃO PASSA POR JAVASCRIPT
 * -------------------------------------------
 * Abrir o seletor de arquivos é uma ação que o navegador só concede sob "user
 * activation" — o crédito que um clique de verdade dá, e que se perde com
 * facilidade. Chamar `input.click()` por código funciona *às vezes*, e depende
 * de como a camada de toque do react-native-web despacha o `onPress`. Quando
 * falha, falha em silêncio: nenhum erro, o botão só não faz nada.
 *
 * A solução que não depende de nada disso é antiga e continua sendo a certa:
 * colocar um `<input type="file">` REAL, transparente, exatamente por cima do
 * botão. O dedo do usuário acerta o input, não o botão — e aí não existe
 * JavaScript no meio para perder a ativação. O botão vira puro desenho.
 *
 * É por isso que ele recebe `onPress={undefined}`: quem responde ao toque é o
 * input invisível.
 *
 * COMO UM <input> APARECE NO MEIO DE COMPONENTES REACT NATIVE
 * ----------------------------------------------------------
 * Na web o react-native-web roda sobre o react-dom, então uma tag HTML comum é
 * renderizada normalmente. Usamos `React.createElement('input', …)` em vez de
 * escrever `<input>` para deixar explícito que isto é uma saída deliberada
 * para o DOM — e ela só existe neste arquivo, que já é exclusivo da web.
 */
export default function SeletorFoto({ titulo = 'Escolher foto', variante = 'claro', onEscolher, style }) {
  // O input é "não controlado": se o usuário escolher a MESMA foto duas vezes,
  // o valor não muda e o `change` não dispara. Trocar a `key` a cada seleção
  // força um input novo, e a segunda escolha volta a funcionar.
  const [geracao, setGeracao] = useState(0);

  async function aoMudar(evento) {
    const arquivo = evento.target.files && evento.target.files[0];
    setGeracao((g) => g + 1);

    // Fechar a caixa sem escolher não dispara `change` na maioria dos
    // navegadores — mas quando dispara, vem sem arquivo. Não é erro.
    if (!arquivo) {
      onEscolher({ status: 'cancelado' });
      return;
    }

    if (!arquivo.type || !arquivo.type.startsWith('image/')) {
      onEscolher({ status: 'erro', mensagem: 'Esse arquivo não é uma imagem. Escolha outra.' });
      return;
    }

    try {
      const uri = await reduzirParaDataUrl(arquivo);
      onEscolher({ status: 'ok', uri });
    } catch (e) {
      console.warn('Falha ao ler a imagem:', e);
      onEscolher({ status: 'erro', mensagem: 'Não consegui ler essa imagem. Tente outra.' });
    }
  }

  return (
    <View style={[estilos.area, style]}>
      <Botao titulo={titulo} variante={variante} onPress={undefined} style={estilos.botao} />

      {React.createElement('input', {
        key: geracao,
        type: 'file',
        accept: 'image/*',
        onChange: aoMudar,
        'aria-label': titulo,
        style: {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0,
          cursor: 'pointer',
          // Sem isto, o Firefox mostra o texto "Nenhum arquivo selecionado"
          // vazando por baixo em alguns temas.
          fontSize: 0,
        },
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  area: { position: 'relative' },
  botao: { height: 40, borderRadius: 20 },
});
