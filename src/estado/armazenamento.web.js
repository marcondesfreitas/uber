/**
 * ARMAZENAMENTO PERSISTENTE — versão WEB
 * ======================================
 * Guarda coisas que precisam sobreviver ao fechamento do app. Hoje o perfil do
 * motorista (nome, foto, contato); a API é genérica para o próximo item não
 * precisar de outro arquivo.
 *
 * POR QUE localStorage
 * --------------------
 * É síncrono, existe em todo navegador desde sempre e sobrevive a fechar a
 * aba, fechar o navegador e reiniciar o telefone. Para um punhado de chaves é
 * a escolha certa; IndexedDB só se pagaria com volume ou consultas.
 *
 * A FOTO CABE AQUI PORQUE JÁ É UM data: URL
 * -----------------------------------------
 * O `SeletorFoto.web.js` reduz a imagem escolhida e devolve um data URL — os
 * bytes embutidos no próprio texto. É isso que torna a persistência possível:
 * um `blob:` URL, que seria o caminho mais óbvio, morre junto com a página que
 * o criou, e voltaria como imagem quebrada no próximo abrir.
 *
 * A API é assíncrona mesmo sem precisar. O `localStorage` responde na hora,
 * mas a versão nativa lê de disco — e uma API que muda de forma conforme a
 * plataforma obrigaria quem chama a saber onde está rodando, que é justamente
 * o que a divisão em dois arquivos existe para evitar.
 */

const PREFIXO = 'uber-drive:';

export async function ler(chave) {
  try {
    return window.localStorage.getItem(PREFIXO + chave);
  } catch (e) {
    // Modo privado antigo do Safari, cookies bloqueados, cota estourada. Nada
    // disso justifica derrubar o app: sem o valor guardado, ele só volta ao
    // estado inicial.
    return null;
  }
}

export async function gravar(chave, valor) {
  try {
    if (valor == null) window.localStorage.removeItem(PREFIXO + chave);
    else window.localStorage.setItem(PREFIXO + chave, valor);
  } catch (e) {
    // Idem. Falhar em SALVAR é mais chato que falhar em ler — a próxima
    // abertura perde a foto —, mas ainda não é motivo para uma tela de erro.
  }
}
