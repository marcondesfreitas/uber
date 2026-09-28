import * as ImagePicker from 'expo-image-picker';

/**
 * ESCOLHA DA FOTO DE PERFIL
 * =========================
 *
 * POR QUE ISTO É UM SERVIÇO E NÃO CÓDIGO NA TELA
 * ----------------------------------------------
 * Escolher uma foto tem quatro desfechos possíveis, e só um é "deu certo":
 *
 *   1. o usuário escolheu uma imagem       → sucesso
 *   2. o usuário abriu e desistiu          → cancelado (NÃO é erro)
 *   3. o usuário negou o acesso à galeria  → precisa de permissão
 *   4. o sistema falhou                    → erro de verdade
 *
 * Deixar isso dentro do componente espalharia quatro caminhos por uma tela que
 * deveria só desenhar campos. Aqui devolvemos sempre um objeto com `status`, e
 * a tela decide o que dizer em cada caso.
 *
 * O ERRO Nº 1 NESTE FLUXO é tratar "cancelado" como falha e mostrar um alerta
 * de erro para quem simplesmente mudou de ideia. É por isso que `cancelado`
 * tem um status próprio em vez de cair no `catch`.
 */

/**
 * Abre a galeria do aparelho.
 *
 * @returns {Promise<{status:'ok'|'cancelado'|'sem_permissao'|'erro', uri?:string, mensagem?:string}>}
 */
export async function escolherDaGaleria() {
  try {
    // A permissão é pedida na hora do uso, não na abertura do app. Pedir tudo
    // de uma vez no primeiro lançamento é o que faz o usuário negar por
    // reflexo — ele ainda não sabe para que serve.
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissao.granted) {
      return {
        status: 'sem_permissao',
        // `canAskAgain: false` significa que o usuário marcou "não perguntar
        // mais": pedir de novo não abre nada, e insistir só confunde. Nesse
        // caso o único caminho é as configurações do sistema.
        mensagem: permissao.canAskAgain
          ? 'Precisamos do acesso às suas fotos para trocar o avatar.'
          : 'Acesso às fotos bloqueado. Libere nas configurações do aparelho.',
      };
    }

    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      // Recorte quadrado obrigatório: o avatar é redondo em toda a interface,
      // e deixar o usuário mandar uma foto 16:9 significa cortar o rosto dele
      // sem avisar. Melhor ele escolher o enquadramento.
      allowsEditing: true,
      aspect: [1, 1],
      // 0.7 corta bem o peso sem estragar um avatar de 120 px. Guardar a
      // original seria desperdício: ela nunca é exibida em tamanho grande.
      quality: 0.7,
    });

    if (r.canceled) return { status: 'cancelado' };

    const asset = r.assets && r.assets[0];
    if (!asset || !asset.uri) {
      return { status: 'erro', mensagem: 'Não consegui ler essa imagem. Tente outra.' };
    }

    return { status: 'ok', uri: asset.uri };
  } catch (e) {
    // Formato exótico, arquivo corrompido, galeria indisponível. Devolvemos
    // uma frase que o usuário entende — a mensagem técnica vai para o console.
    console.warn('Falha ao escolher a foto:', e);
    return { status: 'erro', mensagem: 'Não consegui abrir a galeria. Tente de novo.' };
  }
}
