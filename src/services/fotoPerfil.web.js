/**
 * ESCOLHA DA FOTO DE PERFIL — versão WEB
 * ======================================
 * Mesma interface do `fotoPerfil.js` (nativo), implementação própria. O Metro
 * escolhe este arquivo na build web pelo sufixo `.web`.
 *
 * POR QUE NÃO USAR O expo-image-picker AQUI
 * -----------------------------------------
 * Porque ele não abre a caixa de arquivo no navegador. A implementação web
 * dele faz:
 *
 *     const event = new MouseEvent('click');
 *     input.dispatchEvent(event);
 *
 * e um MouseEvent criado por script é UNTRUSTED. Abrir o seletor de arquivos é
 * uma das ações que o navegador só permite sob "user activation" — o crédito
 * que um clique de verdade concede, e que dura um punhado de milissegundos.
 *
 * Pior: qualquer `await` antes disso GASTA esse crédito. A primeira versão
 * deste serviço pedia a permissão da galeria antes de abrir o seletor:
 *
 *     await ImagePicker.requestMediaLibraryPermissionsAsync();  // ← mata o gesto
 *     await ImagePicker.launchImageLibraryAsync();              // ← nunca abre
 *
 * No navegador essa permissão nem existe (o próprio seletor É a permissão), e
 * o await só servia para quebrar o fluxo. O sintoma é cruel: nenhum erro,
 * nenhum log, o botão simplesmente não faz nada.
 *
 * A REGRA, QUE VALE PARA MUITO ALÉM DESTE ARQUIVO
 * -----------------------------------------------
 * Ações que exigem gesto do usuário — abrir arquivo, entrar em tela cheia,
 * tocar áudio, abrir uma janela — precisam ser disparadas ANTES do primeiro
 * `await` do manipulador. Aqui `input.click()` é a primeira coisa que roda;
 * tudo o que é assíncrono acontece depois, dentro da Promise.
 *
 * ⚠️ AINDA ASSIM, ESTE NÃO É O CAMINHO PRINCIPAL
 * ----------------------------------------------
 * Mesmo fazendo tudo certo, `input.click()` por JavaScript continua dependendo
 * de o navegador reconhecer a ativação — e isso varia com a forma como a
 * camada de toque do react-native-web despacha o `onPress`. É um lugar frágil
 * demais para uma função central do app.
 *
 * Por isso o botão "Escolher foto" usa o `SeletorFoto`, que põe um
 * `<input type="file">` real POR CIMA do botão: o clique do usuário cai no
 * input, e não existe mais JavaScript no meio para perder a ativação.
 *
 * Esta função fica como caminho alternativo (útil para acionar a escolha de
 * um lugar que não seja um botão) e porque a redução de imagem abaixo é
 * compartilhada com o seletor.
 */

/** Maior lado da imagem guardada. Um avatar nunca passa de 120 px na tela. */
const LADO_MAXIMO = 512;

/**
 * Abre o seletor de arquivos do navegador.
 *
 * @returns {Promise<{status:'ok'|'cancelado'|'erro', uri?:string, mensagem?:string}>}
 */
export function escolherDaGaleria() {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve({ status: 'erro', mensagem: 'Seleção de imagem indisponível aqui.' });
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    // `accept` filtra o que o seletor mostra, mas NÃO garante nada: dá para
    // escolher "todos os arquivos" em qualquer sistema. A validação de
    // verdade vem depois, no `type` do arquivo.
    input.accept = 'image/*';
    input.style.display = 'none';
    document.body.appendChild(input);

    let resolvido = false;
    const encerrar = (r) => {
      if (resolvido) return;
      resolvido = true;
      if (input.parentNode) input.parentNode.removeChild(input);
      resolve(r);
    };

    input.addEventListener('change', async () => {
      const arquivo = input.files && input.files[0];
      if (!arquivo) {
        encerrar({ status: 'cancelado' });
        return;
      }

      if (!arquivo.type || !arquivo.type.startsWith('image/')) {
        encerrar({ status: 'erro', mensagem: 'Esse arquivo não é uma imagem. Escolha outra.' });
        return;
      }

      try {
        const uri = await reduzirParaDataUrl(arquivo);
        encerrar({ status: 'ok', uri });
      } catch (e) {
        console.warn('Falha ao ler a imagem:', e);
        encerrar({ status: 'erro', mensagem: 'Não consegui ler essa imagem. Tente outra.' });
      }
    });

    // Os navegadores modernos avisam quando a pessoa fecha o seletor sem
    // escolher nada. Sem isto a Promise ficaria pendurada para sempre — e a
    // tela nunca saberia que pode voltar ao normal.
    input.addEventListener('cancel', () => encerrar({ status: 'cancelado' }));

    // PRIMEIRA coisa a rodar, ainda dentro do gesto do usuário. Note que é
    // `input.click()` — o método nativo, que carrega a ativação — e não um
    // evento fabricado à mão.
    input.click();
  });
}

/**
 * Lê o arquivo, reduz para no máximo 512 px de lado e devolve uma data URL.
 *
 * POR QUE REDUZIR
 * ---------------
 * Uma foto de celular tem 4000 px e vários MB. Como data URL (base64) ela
 * cresce mais uns 33% e vira uma string gigante dentro do estado do React —
 * copiada a cada render do perfil. Para um avatar de 120 px, é desperdício
 * pesado. 512 px cobre telas de alta densidade com folga.
 *
 * É também o que devolve na web o que o `quality`/`allowsEditing` já faziam no
 * celular, e que o picker do Expo ignora no navegador.
 */
export function reduzirParaDataUrl(arquivo) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();

    leitor.onerror = () => reject(new Error('FileReader falhou'));

    leitor.onload = () => {
      const img = new window.Image();

      // Só aqui sabemos se os bytes são MESMO uma imagem: um arquivo de texto
      // renomeado para .png passa pelo filtro do `accept` e pelo `type`, e é
      // no decode que ele falha.
      img.onerror = () => reject(new Error('Imagem inválida ou corrompida'));

      img.onload = () => {
        try {
          const escala = Math.min(1, LADO_MAXIMO / Math.max(img.width, img.height));
          const largura = Math.max(1, Math.round(img.width * escala));
          const altura = Math.max(1, Math.round(img.height * escala));

          const cv = document.createElement('canvas');
          cv.width = largura;
          cv.height = altura;
          cv.getContext('2d').drawImage(img, 0, 0, largura, altura);

          // JPEG a 85%: um avatar não precisa de transparência, e PNG de foto
          // fica várias vezes maior sem ganho visível.
          resolve(cv.toDataURL('image/jpeg', 0.85));
        } catch (e) {
          reject(e);
        }
      };

      img.src = leitor.result;
    };

    leitor.readAsDataURL(arquivo);
  });
}
