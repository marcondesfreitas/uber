/**
 * GERADOR DAS ILUSTRAÇÕES DE VEÍCULO
 * ==================================
 * Recorta o fundo de `assets/veiculos/*-fonte.*` e grava `carro.png` e
 * `moto.png` com transparência, prontos para os cards.
 *
 *   npm run veiculos
 *   → abra http://localhost:8099 e clique em Gerar
 *
 * POR QUE ELE PRECISA DO NAVEGADOR
 * --------------------------------
 * As origens são JPEG. O Node não decodifica JPEG sem uma dependência nativa
 * (sharp, canvas), e este projeto não tem nenhuma. O navegador decodifica de
 * fábrica, então o script serve os arquivos, a página faz o trabalho de pixel
 * e devolve o resultado para o disco.
 *
 * É mais cerimônia que um comando só, mas é a diferença entre um recorte
 * REPRODUZÍVEL e PNGs que apareceram no repositório sem ninguém saber como.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * AS DUAS REGRAS QUE FAZEM O RECORTE
 * ─────────────────────────────────────────────────────────────────────────
 *
 * 1. FUNDO É UMA FAIXA DE TOM QUE ALCANÇA A BORDA DA IMAGEM. Duas coisas
 *    nessa frase, e as duas foram aprendidas errando:
 *
 *    "Alcança a borda" e não "todo pixel dessa cor": os veículos são brancos e
 *    têm vidros e pneus pretos. Um teste só de cor comeria a carroceria num
 *    caso e os pneus no outro. Partindo das bordas, branco cercado por carro e
 *    preto cercado por carro sobrevivem.
 *
 *    FAIXA (`fundoDe`..`fundoAte`) e não limiar: o render da moto veio sobre
 *    cinza-escuro (23), e as partes pretas dela são MAIS ESCURAS que o fundo
 *    (0 a 19). Um corte do tipo "tudo abaixo de 26" levava os pneus junto —
 *    era isso que aparecia como sombra neles. Com faixa, o preto do pneu fica
 *    FORA do intervalo e barra o preenchimento.
 *
 *    A faixa cobre as duas polaridades sem código extra: fundo branco é
 *    242..255, fundo preto é 0..8, fundo cinza é 19..28.
 *
 * 2. PEDAÇOS MINÚSCULOS SÃO LIXO. O JPEG deixa ruído nas bordas do recorte —
 *    algumas centenas de manchinhas soltas de poucos pixels. Descartar tudo
 *    abaixo de `minimoPedaco` limpa isso sem tocar no veículo, que tem
 *    centenas de milhares de pixels. Também protege contra fundo que fique
 *    "ilhado" dentro da arte.
 *
 * NÃO HÁ TRATAMENTO DE SOMBRA AQUI, de propósito: estes renders não têm
 * sombra projetada. Uma versão anterior precisava inverter a polaridade da
 * sombra — sombra clara sobre card escuro vira mancha — e isso saiu junto com
 * as artes antigas. Se um dia entrar um render COM sombra sobre fundo claro,
 * ela vai aparecer como um borrão claro, e o conserto é esse: redesenhar a
 * sombra em preto com opacidade proporcional, em vez de copiá-la como está.
 *
 * Para trocar a arte: substitua o `*-fonte.*`, ajuste os limiares MEDINDO a
 * nova imagem (não herde os daqui) e rode de novo.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const PASTA = path.join(RAIZ, 'assets', 'veiculos');
const PORTA = 8099;

/**
 * Faixas MEDIDAS por arte — não herde as de uma para a outra.
 *
 * Carro: fundo preto puro (828 mil pixels em luminância 0) e nada em massa
 * entre 12 e 230. Os pneus ficam acima de 12, então 0..8 separa com folga.
 *
 * Moto: fundo cinza-escuro (454 mil pixels em 23; a borda varia de 20 a 26).
 * As partes pretas da moto vão de 0 a 19, abaixo do fundo. 19..28 pega o
 * fundo inteiro e para no preto.
 */
const PECAS = [
  {
    saida: 'carro.png',
    fonte: 'carro-fonte.jpg',
    tipo: 'image/jpeg',
    fundoDe: 0,
    fundoAte: 8,
    minimoPedaco: 1000,
  },
  {
    saida: 'moto.png',
    fonte: 'moto-fonte.jpg',
    tipo: 'image/jpeg',
    fundoDe: 19,
    fundoAte: 28,
    minimoPedaco: 1000,
  },
];

const LARG_MAX = 480;
const ALT_MAX = 300;

const PAGINA = `<!doctype html>
<meta charset="utf-8"><title>Gerar ilustrações de veículo</title>
<body style="background:#0B0B0F;color:#fff;font:15px system-ui;padding:32px">
<h1 style="font-size:20px">Ilustrações de veículo</h1>
<button id="ir" style="font:600 15px system-ui;padding:10px 20px;border-radius:8px;border:0;background:#3E6FF0;color:#fff;cursor:pointer">Gerar</button>
<pre id="log" style="white-space:pre-wrap;line-height:1.6"></pre>
<script>
const PECAS = ${JSON.stringify(PECAS)};
const LARG_MAX = ${LARG_MAX}, ALT_MAX = ${ALT_MAX};
const log = (t) => { document.getElementById('log').textContent += t + '\\n'; };

async function gerar(peca) {
  const img = new Image();
  await new Promise((ok, no) => { img.onload = ok; img.onerror = no; img.src = '/fonte/' + peca.fonte; });
  const L = img.naturalWidth, A = img.naturalHeight;
  const cv = document.createElement('canvas');
  cv.width = L; cv.height = A;
  const cx = cv.getContext('2d', { willReadFrequently: true });
  cx.drawImage(img, 0, 0);
  const px = cx.getImageData(0, 0, L, A).data;

  // Math.round e não |0: 255 em ponto flutuante dá 254,9999, e truncar
  // transformaria branco puro em 254 — um limiar de 255 nunca bateria.
  const lum = new Uint8Array(L * A);
  for (let i = 0, p = 0; i < px.length; i += 4, p++) {
    lum[p] = Math.round(0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]);
  }

  const fila = new Int32Array(L * A);

  // 1. Fundo: preenchimento a partir das quatro bordas, dentro da faixa.
  const ehFundo = (p) => lum[p] >= peca.fundoDe && lum[p] <= peca.fundoAte;

  const fundo = new Uint8Array(L * A);
  let ini = 0, fim = 0;
  const por = (p) => { if (!fundo[p] && ehFundo(p)) { fundo[p] = 1; fila[fim++] = p; } };
  for (let x = 0; x < L; x++) { por(x); por((A - 1) * L + x); }
  for (let y = 0; y < A; y++) { por(y * L); por(y * L + L - 1); }
  while (ini < fim) {
    const p = fila[ini++], x = p % L, y = (p / L) | 0;
    if (x > 0) por(p - 1);
    if (x < L - 1) por(p + 1);
    if (y > 0) por(p - L);
    if (y < A - 1) por(p + L);
  }

  // 2. Rotula o que sobrou e descarta os pedaços pequenos.
  const rot = new Int32Array(L * A).fill(-1);
  const tamanhos = [];
  for (let s = 0; s < L * A; s++) {
    if (fundo[s] || rot[s] >= 0) continue;
    const r = tamanhos.length;
    let tam = 0; ini = 0; fim = 0;
    rot[s] = r; fila[fim++] = s;
    while (ini < fim) {
      const p = fila[ini++]; tam++;
      const x = p % L, y = (p / L) | 0;
      const viz = [];
      if (x > 0) viz.push(p - 1);
      if (x < L - 1) viz.push(p + 1);
      if (y > 0) viz.push(p - L);
      if (y < A - 1) viz.push(p + L);
      for (const q of viz) if (!fundo[q] && rot[q] < 0) { rot[q] = r; fila[fim++] = q; }
    }
    tamanhos.push(tam);
  }

  let x0 = L, y0 = A, x1 = -1, y1 = -1, mantidos = 0;
  const manter = new Uint8Array(L * A);
  for (let p = 0; p < L * A; p++) {
    if (rot[p] < 0 || tamanhos[rot[p]] <= peca.minimoPedaco) continue;
    manter[p] = 1;
    const x = p % L, y = (p / L) | 0;
    if (x < x0) x0 = x; if (x > x1) x1 = x;
    if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  for (const t of tamanhos) if (t > peca.minimoPedaco) mantidos++;

  // 3. Recorta na caixa da arte e reduz.
  const cL = x1 - x0 + 1, cA = y1 - y0 + 1;
  const recorte = document.createElement('canvas');
  recorte.width = cL; recorte.height = cA;
  const rx = recorte.getContext('2d');
  const dados = rx.getImageData(0, 0, cL, cA), dp = dados.data;
  for (let y = 0; y < cA; y++) {
    for (let x = 0; x < cL; x++) {
      const p = (y + y0) * L + (x + x0);
      if (!manter[p]) continue;
      const i = p * 4, o = (y * cL + x) * 4;
      dp[o] = px[i]; dp[o + 1] = px[i + 1]; dp[o + 2] = px[i + 2]; dp[o + 3] = 255;
    }
  }
  rx.putImageData(dados, 0, 0);

  const k = Math.min(LARG_MAX / cL, ALT_MAX / cA, 1);
  const saida = document.createElement('canvas');
  saida.width = Math.round(cL * k); saida.height = Math.round(cA * k);
  const sx = saida.getContext('2d');
  sx.imageSmoothingQuality = 'high';
  sx.drawImage(recorte, 0, 0, saida.width, saida.height);

  const blob = await new Promise((ok) => saida.toBlob(ok, 'image/png'));
  await fetch('/salvar/' + peca.saida, { method: 'POST', body: blob });
  log(peca.saida + '  origem ' + L + 'x' + A + '  pedacos ' + tamanhos.length +
      ' (mantidos ' + mantidos + ')  recorte ' + cL + 'x' + cA +
      '  final ' + saida.width + 'x' + saida.height + '  ' + (blob.size / 1024).toFixed(1) + ' KB');
}

document.getElementById('ir').onclick = async () => {
  document.getElementById('log').textContent = '';
  for (const p of PECAS) await gerar(p);
  log('pronto — pode fechar e encerrar o script (Ctrl+C)');
};
</script>`;

const servidor = http.createServer((req, res) => {
  if (req.url.startsWith('/fonte/')) {
    const nome = path.basename(req.url.slice('/fonte/'.length));
    const peca = PECAS.find((p) => p.fonte === nome);
    const alvo = path.join(PASTA, nome);
    if (!peca || !fs.existsSync(alvo)) return res.writeHead(404).end('sem ' + nome);
    res.writeHead(200, { 'Content-Type': peca.tipo });
    return fs.createReadStream(alvo).pipe(res);
  }

  if (req.method === 'POST' && req.url.startsWith('/salvar/')) {
    const nome = path.basename(req.url.slice('/salvar/'.length));
    if (!PECAS.some((p) => p.saida === nome)) return res.writeHead(400).end('nome inesperado');
    const partes = [];
    req.on('data', (c) => partes.push(c));
    return req.on('end', () => {
      const buf = Buffer.concat(partes);
      fs.writeFileSync(path.join(PASTA, nome), buf);
      console.log('gravado assets/veiculos/' + nome + '  ' + (buf.length / 1024).toFixed(1) + ' KB');
      res.writeHead(200).end('ok');
    });
  }

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(PAGINA);
});

servidor.listen(PORTA, () => {
  console.log('Abra http://localhost:' + PORTA + ' e clique em Gerar.');
  console.log('Ctrl+C para encerrar quando terminar.');
});
