/**
 * INJEÇÃO DE METADADOS NO index.html
 * ==================================
 * Roda DEPOIS do `expo export --platform web` e acrescenta ao `<head>` o que
 * o exportador do Expo não escreve: ícones, manifest do PWA e as tags de
 * compartilhamento (Open Graph).
 *
 * POR QUE UM PASSO PÓS-BUILD
 * --------------------------
 * O `index.html` da build web do Expo é GERADO — não existe um arquivo no
 * projeto para editar. Editar o gerado à mão funcionaria até o próximo build,
 * que o sobrescreveria em silêncio.
 *
 * Um passo pós-build resolve de vez: ele roda toda vez, faz parte do comando
 * de build (veja `vercel.json`), e é impossível esquecer. Projetos com
 * Expo Router usam `app/+html.tsx` para isso; sem router, este é o caminho.
 *
 * É IDEMPOTENTE: se as tags já estiverem lá, ele não duplica. Isso importa
 * porque builds locais e na Vercel podem rodar em cima do mesmo `dist`.
 */
const fs = require('fs');
const path = require('path');

/** Trocar aqui muda o nome em TODAS as superfícies de uma vez. */
const NOME = 'Uber Drive';
const DESCRICAO =
  'Protótipo didático de app de motorista, feito em React Native + Expo. ' +
  'Demanda, preço dinâmico e corridas são simulados no aparelho.';

// A URL precisa ser ABSOLUTA no og:image: quem monta a prévia (WhatsApp,
// Slack, Twitter) busca a imagem sem saber de onde veio o link.
const SITE = process.env.SITE_URL || 'https://uber-drive.vercel.app';

const MARCA = '<!-- metadados-injetados -->';

const TAGS = `${MARCA}
    <link rel="icon" type="image/png" sizes="48x48" href="/favicon.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/manifest.json" />

    <meta name="theme-color" content="#0B0B0F" />
    <meta name="description" content="${DESCRICAO}" />

    <!-- "Adicionar à Tela de Início" no iOS: sem estas três, o iPhone abre o
         site numa aba do Safari em vez de em tela cheia, e usa uma captura da
         página como ícone. -->
    <meta name="apple-mobile-web-app-capable" content="yes" />

    <!-- POR QUE "black" E NÃO "black-translucent".
         Com black-translucent o iOS desenha a barra de status POR CIMA do app
         e transfere para a página a responsabilidade de pintar aquela faixa.
         São várias coisas que precisam dar certo em cadeia — viewport-fit,
         fundo do documento, área segura — e qualquer uma que falhe deixa a
         tarja branca no topo.

         Com "black" quem pinta a faixa é o próprio iOS, sempre. O app começa
         logo abaixo dela e não existe pixel sem dono. Combina com o fundo do
         app (#0B0B0F, quase preto), e troca um risco por uma certeza.

         Efeito colateral esperado: env(safe-area-inset-top) passa a valer 0,
         porque não há mais nada do sistema sobre o conteúdo. A sonda em
         Tela.js lê isso e o respiro do topo vira só os 8 px de folga. -->
    <meta name="apple-mobile-web-app-status-bar-style" content="black" />
    <meta name="apple-mobile-web-app-title" content="${NOME}" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${NOME}" />
    <meta property="og:title" content="${NOME}" />
    <meta property="og:description" content="${DESCRICAO}" />
    <meta property="og:image" content="${SITE}/og.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="${SITE}/" />
    <meta name="twitter:card" content="summary_large_image" />

    <!-- SPEED INSIGHTS DA VERCEL
         Mede as Core Web Vitals (carregamento, resposta ao toque, estabilidade
         do layout) com visitantes reais e manda para o painel da Vercel.

         POR QUE UM SCRIPT E NÃO O PACOTE @vercel/speed-insights
         ------------------------------------------------------
         A documentação da Vercel mostra o import de um COMPONENTE, mas em duas
         variantes por framework — /next, /react, /vue… Este app é Expo/React
         Native Web: o /next não existe aqui, e o /react traria uma dependência
         nova que precisaria de um arquivo .web.js para não entrar na build
         nativa, onde não há navegador.

         O componente daquele pacote faz exatamente uma coisa: injetar este
         script. Injetando direto, o resultado é o mesmo com zero dependência e
         sem risco para o build do celular.

         ⚠️ Só coleta se Speed Insights estiver LIGADO no projeto da Vercel
         (aba Speed Insights do painel). Sem isso o endereço abaixo responde
         404 e nenhum dado aparece — sem erro visível na tela. -->
    <script defer src="/_vercel/speed-insights/script.js"></script>

    <style>
      /* O reset do Expo dá altura 100% ao documento, mas não pinta o fundo.
         Com a viewport cobrindo a tela inteira, qualquer pixel que o app não
         desenhe mostra o branco padrão do navegador — e num app escuro isso
         salta aos olhos. Pintar aqui é a rede de segurança: mesmo durante o
         carregamento, antes de o React montar, a tela já nasce escura. */
      html, body { background-color: #0B0B0F; }

      /* A RAIZ NÃO LEVA A ÁREA SEGURA — de propósito.
         A primeira tentativa pôs padding de env(safe-area-inset-*) aqui, e o
         efeito foi empurrar o app inteiro para dentro: o mapa deixou de chegar
         às bordas e sobrou uma faixa vazia embaixo.

         Num app de tela cheia é o contrário do que se quer. O FUNDO tem de
         cobrir tudo, de canto a canto; quem se afasta das bordas é só o
         CONTEÚDO — o título no topo, os ícones da barra de baixo. Por isso a
         área segura é medida em JS (TOPO_SEGURO e BASE_SEGURA, em
         src/components/ui/Tela.js) e aplicada como padding de cada um. */
    </style>`;

const alvo = path.join(__dirname, '..', 'dist', 'index.html');

if (!fs.existsSync(alvo)) {
  console.error('injetar-head: dist/index.html não existe. Rode o export antes.');
  process.exit(1);
}

let html = fs.readFileSync(alvo, 'utf8');

if (html.includes(MARCA)) {
  console.log('injetar-head: metadados já presentes, nada a fazer.');
  process.exit(0);
}

// O título gerado vem do `name` do app.json; aqui ele passa a valer para a web.
html = html.replace(/<title>[^<]*<\/title>/, `<title>${NOME}</title>`);

/**
 * `viewport-fit=cover` — a linha que faz o app ocupar a tela inteira do iPhone.
 *
 * Sem ela, a viewport do Safari PARA nas bordas seguras: o app é desenhado
 * abaixo da barra de status e acima do indicador de gestos, e as faixas que
 * sobram ficam com o fundo padrão do documento — branco. É a tarja branca no
 * topo, que parece "imagem faltando" mas é a página não chegando lá.
 *
 * O efeito colateral é que `env(safe-area-inset-*)` só passa a valer diferente
 * de zero DEPOIS dela. As duas coisas andam juntas: uma faz o app cobrir a
 * tela toda, a outra diz onde o sistema vai desenhar por cima.
 *
 * O Expo gera esta meta, então corrigimos a existente em vez de acrescentar
 * outra — duas metas de viewport e o navegador escolhe uma, sem avisar qual.
 */
html = html.replace(
  /(<meta name="viewport" content="[^"]*)"/,
  '$1, viewport-fit=cover"'
);

// Injeta logo antes do </head> para as tags virem depois das do Expo.
html = html.replace('</head>', `    ${TAGS}\n  </head>`);

fs.writeFileSync(alvo, html);

const conferir = ['favicon.png', 'apple-touch-icon.png', 'icone-192.png', 'icone-512.png', 'og.png', 'manifest.json'];
const faltando = conferir.filter((f) => !fs.existsSync(path.join(__dirname, '..', 'dist', f)));

console.log('injetar-head: metadados adicionados, título = "' + NOME + '"');
if (faltando.length) {
  // Aviso alto: o HTML apontaria para arquivos que não existem, e o sintoma
  // (ícone genérico) é fácil de não notar.
  console.warn('injetar-head: ⚠ ausentes em dist/ → ' + faltando.join(', '));
  console.warn('  Eles vêm de public/ — rode `node scripts/gerar-icones.js`.');
} else {
  console.log('injetar-head: todos os ícones presentes em dist/');
}
