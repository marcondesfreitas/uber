/**
 * GERADOR DE ÍCONES DO APP
 * ========================
 * Deriva TODAS as superfícies da marca de UM único arquivo de origem:
 * `assets/marca-fonte.png`.
 *
 * POR QUE UM SCRIPT E NÃO ARQUIVOS SOLTOS
 * ---------------------------------------
 * A marca aparece em sete lugares (favicon, PWA 192 e 512, apple-touch, ícone
 * nativo, ícone adaptativo do Android, splash e prévia de link). Mantê-los à
 * mão significa que, no dia em que a marca mudar, seis deles ficam
 * desatualizados sem ninguém perceber. Gerando por script, todos saem do mesmo
 * arquivo, sempre.
 *
 * PARA TROCAR A MARCA
 * -------------------
 * Substitua `assets/marca-fonte.png` e rode `node scripts/gerar-icones.js`.
 * Nada mais precisa mudar. A origem deve ser a arte clara sobre fundo escuro
 * (ou fundo transparente), quadrada ou não — o script recorta as margens
 * sozinho.
 *
 * COMO ELE LÊ A ORIGEM
 * --------------------
 * A arte é branca sobre preto, então o BRILHO de cada pixel já é a máscara da
 * marca: preto = fundo, branco = traço, cinza = a borda suavizada. Convertendo
 * brilho em transparência ganhamos um logotipo recortado com antisserrilhado
 * de graça, sem precisar de um PNG com alfa. Se a origem já tiver alfa, ele é
 * respeitado (multiplicado pelo brilho).
 */
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const RAIZ = path.join(__dirname, '..');
const ORIGEM = path.join(RAIZ, 'assets', 'marca-fonte.png');
const PUBLICO = path.join(RAIZ, 'public');
const ATIVOS = path.join(RAIZ, 'assets');

/** cores.fundo — o mesmo tom do app, para o ícone não destoar da splash. */
const FUNDO = [11, 11, 15];

// ── Origem → marca recortada com alfa ────────────────────────────────────

/**
 * Lê a origem e devolve `{ largura, altura, dados }` em RGBA, já recortada na
 * caixa que contém a arte. O recorte importa: um logotipo com 20% de margem
 * embutida vira um ícone pequeno demais dentro do quadrado, e a margem final
 * deixa de ser controlável aqui.
 */
function lerMarca() {
  const png = PNG.sync.read(fs.readFileSync(ORIGEM));
  const { width: L, height: A, data } = png;

  const rgba = Buffer.alloc(L * A * 4);
  let x0 = L, y0 = A, x1 = -1, y1 = -1;

  for (let y = 0; y < A; y++) {
    for (let x = 0; x < L; x++) {
      const i = (y * L + x) * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      // Luminância perceptual: o olho pesa verde mais que vermelho, e este é
      // o mesmo coeficiente que qualquer editor usa para "dessaturar".
      const brilho = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      const alfa = Math.round(brilho * (data[i + 3] / 255) * 255);

      // Arte branca: a cor final é branca em todo lugar, o alfa é que desenha.
      rgba[i] = 255; rgba[i + 1] = 255; rgba[i + 2] = 255; rgba[i + 3] = alfa;

      // Limiar baixo (não zero) para ignorar ruído de compressão no fundo.
      if (alfa > 8) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }

  if (x1 < 0) throw new Error('assets/marca-fonte.png parece vazia (tudo escuro).');

  const cL = x1 - x0 + 1;
  const cA = y1 - y0 + 1;
  const corte = Buffer.alloc(cL * cA * 4);
  for (let y = 0; y < cA; y++) {
    rgba.copy(corte, y * cL * 4, ((y + y0) * L + x0) * 4, ((y + y0) * L + x0 + cL) * 4);
  }
  return { largura: cL, altura: cA, dados: corte };
}

// ── Redução ──────────────────────────────────────────────────────────────

/**
 * Reduz por MÉDIA DE CAIXA: cada pixel de saída é a média de todos os pixels
 * de origem que caem dentro dele. Para reduções grandes (1800 px → 48 px) isso
 * é o certo; pegar só o pixel mais próximo descartaria 99% da informação e o
 * favicon sairia esfarelado.
 *
 * A média é feita com o alfa PRÉ-MULTIPLICADO: sem isso, pixels transparentes
 * arrastariam sua cor para dentro da média e a borda ganharia um halo.
 */
function reduzir(img, novaL, novaA) {
  const saida = Buffer.alloc(novaL * novaA * 4);
  const escX = img.largura / novaL;
  const escY = img.altura / novaA;

  for (let y = 0; y < novaA; y++) {
    const iy0 = Math.floor(y * escY);
    const iy1 = Math.max(iy0 + 1, Math.ceil((y + 1) * escY));
    for (let x = 0; x < novaL; x++) {
      const ix0 = Math.floor(x * escX);
      const ix1 = Math.max(ix0 + 1, Math.ceil((x + 1) * escX));

      let r = 0, g = 0, b = 0, a = 0, n = 0;
      for (let sy = iy0; sy < iy1 && sy < img.altura; sy++) {
        for (let sx = ix0; sx < ix1 && sx < img.largura; sx++) {
          const i = (sy * img.largura + sx) * 4;
          const al = img.dados[i + 3] / 255;
          r += img.dados[i] * al; g += img.dados[i + 1] * al; b += img.dados[i + 2] * al;
          a += img.dados[i + 3];
          n++;
        }
      }
      const o = (y * novaL + x) * 4;
      const alfaMedio = a / n;
      const peso = alfaMedio / 255;
      // Desfaz a pré-multiplicação para voltar à cor real.
      saida[o] = peso ? Math.round(r / n / peso) : 0;
      saida[o + 1] = peso ? Math.round(g / n / peso) : 0;
      saida[o + 2] = peso ? Math.round(b / n / peso) : 0;
      saida[o + 3] = Math.round(alfaMedio);
    }
  }
  return { largura: novaL, altura: novaA, dados: saida };
}

// ── Composição ───────────────────────────────────────────────────────────

/**
 * Põe a marca centrada numa tela de `largura`×`altura`.
 *
 * @param margem fração da MENOR dimensão que fica livre em volta. 0.14 é o que
 *   as lojas pedem para o ícone não encostar na borda do recorte redondo.
 * @param fundo `null` deixa a tela transparente (splash), ou [r,g,b] pinta.
 */
function compor(marca, largura, altura, margem, fundo) {
  const util = Math.min(largura, altura) * (1 - margem * 2);
  const escala = Math.min(util / marca.largura, util / marca.altura);
  const mL = Math.max(1, Math.round(marca.largura * escala));
  const mA = Math.max(1, Math.round(marca.altura * escala));
  const pequena = reduzir(marca, mL, mA);

  const dx = Math.round((largura - mL) / 2);
  const dy = Math.round((altura - mA) / 2);

  const png = new PNG({ width: largura, height: altura });
  for (let y = 0; y < altura; y++) {
    for (let x = 0; x < largura; x++) {
      const o = (y * largura + x) * 4;
      if (fundo) {
        png.data[o] = fundo[0]; png.data[o + 1] = fundo[1]; png.data[o + 2] = fundo[2]; png.data[o + 3] = 255;
      } else {
        png.data[o] = 0; png.data[o + 1] = 0; png.data[o + 2] = 0; png.data[o + 3] = 0;
      }

      const sx = x - dx, sy = y - dy;
      if (sx < 0 || sy < 0 || sx >= mL || sy >= mA) continue;

      const i = (sy * mL + sx) * 4;
      const al = pequena.dados[i + 3] / 255;
      if (!al) continue;

      if (fundo) {
        // Mistura normal sobre fundo opaco.
        png.data[o] = Math.round(pequena.dados[i] * al + fundo[0] * (1 - al));
        png.data[o + 1] = Math.round(pequena.dados[i + 1] * al + fundo[1] * (1 - al));
        png.data[o + 2] = Math.round(pequena.dados[i + 2] * al + fundo[2] * (1 - al));
        png.data[o + 3] = 255;
      } else {
        pequena.dados.copy(png.data, o, i, i + 4);
      }
    }
  }
  return PNG.sync.write(png, { deflateLevel: 9 });
}

// ── Saída ────────────────────────────────────────────────────────────────

const marca = lerMarca();
fs.mkdirSync(PUBLICO, { recursive: true });

function gravar(arquivo, buf) {
  fs.writeFileSync(arquivo, buf);
  const rel = path.relative(RAIZ, arquivo).replace(/\\/g, '/');
  console.log(rel.padEnd(30) + (buf.length / 1024).toFixed(1).padStart(7) + ' KB');
}

console.log('origem: assets/marca-fonte.png -> arte recortada ' + marca.largura + 'x' + marca.altura + '\n');

// 1. Web e PWA — quadrados opacos, marca sobre o fundo do app.
for (const [nome, t] of [
  ['favicon.png', 48],
  ['icone-192.png', 192],
  ['icone-512.png', 512],
  ['apple-touch-icon.png', 180],
]) {
  gravar(path.join(PUBLICO, nome), compor(marca, t, t, 0.14, FUNDO));
}

// 2. Prévia ao compartilhar o link — retangular, marca menor por ser um
//    cartão largo e não um ícone.
gravar(path.join(PUBLICO, 'og.png'), compor(marca, 1200, 630, 0.22, FUNDO));

// 3. Nativo (Expo). O ícone da loja é opaco; o ADAPTATIVO do Android precisa
//    de fundo transparente e de muito mais folga — o sistema recorta em
//    círculo, quadrado ou gota conforme o aparelho, e come as bordas.
gravar(path.join(ATIVOS, 'icone.png'), compor(marca, 1024, 1024, 0.14, FUNDO));
gravar(path.join(ATIVOS, 'icone-adaptativo.png'), compor(marca, 1024, 1024, 0.26, null));

// 4. Splash e telas do app — transparente, para assentar sobre qualquer fundo.
gravar(path.join(ATIVOS, 'marca.png'), compor(marca, 1024, 1024, 0.06, null));
