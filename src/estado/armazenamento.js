import * as FileSystem from 'expo-file-system';

/**
 * ARMAZENAMENTO PERSISTENTE — versão NATIVA (iOS e Android)
 * =========================================================
 * Mesma API do `armazenamento.web.js`; o Metro escolhe o arquivo pela
 * plataforma. Quem chama não sabe em qual está.
 *
 * POR QUE expo-file-system E NÃO AsyncStorage
 * -------------------------------------------
 * O `AsyncStorage` seria o equivalente direto do localStorage, mas é mais uma
 * dependência para instalar e manter compatível com a versão do Expo. O
 * `expo-file-system` já vem no projeto (o seletor de foto o usa), e para um
 * punhado de chaves um arquivo JSON resolve igual.
 *
 * Um arquivo só, e não um por chave: são poucos valores, e ler um arquivo é
 * mais barato que listar um diretório.
 *
 * O QUE FICA GUARDADO NO NATIVO
 * -----------------------------
 * A foto vem do seletor como um caminho `file://` para uma cópia que o próprio
 * ImagePicker fez no diretório do app. Guardamos o CAMINHO, não os bytes.
 *
 * Isso tem um limite honesto: o sistema pode limpar o cache do app quando o
 * armazenamento aperta, e aí o caminho aponta para um arquivo que não existe
 * mais — a foto volta a ser o avatar padrão. Copiar os bytes para um diretório
 * permanente resolveria, e é o passo natural quando o app deixar de ser
 * protótipo. Na web o problema não existe: lá a foto É os bytes.
 */

const ARQUIVO = FileSystem.documentDirectory + 'preferencias.json';

async function lerTudo() {
  try {
    const info = await FileSystem.getInfoAsync(ARQUIVO);
    if (!info.exists) return {};
    return JSON.parse(await FileSystem.readAsStringAsync(ARQUIVO));
  } catch (e) {
    // Arquivo corrompido ou ilegível: começa do zero em vez de derrubar o app.
    return {};
  }
}

export async function ler(chave) {
  const tudo = await lerTudo();
  return tudo[chave] ?? null;
}

export async function gravar(chave, valor) {
  try {
    const tudo = await lerTudo();
    if (valor == null) delete tudo[chave];
    else tudo[chave] = valor;
    await FileSystem.writeAsStringAsync(ARQUIVO, JSON.stringify(tudo));
  } catch (e) {
    // Sem espaço em disco, permissão negada. A sessão atual segue funcionando;
    // só a próxima abertura não vai lembrar.
  }
}
