import { Platform } from 'react-native';

/**
 * O DRIVER DAS ANIMAÇÕES
 * ======================
 *
 * `useNativeDriver: true` manda a animação para a thread nativa. No celular
 * isso é claramente melhor: ela continua a 60 fps mesmo com o JavaScript
 * ocupado — exatamente nos momentos em que o usuário está tocando a tela.
 *
 * No navegador não existe thread nativa de animação. O React Native percebe
 * isso, avisa no console ("useNativeDriver is not supported…") e cai para uma
 * animação em JavaScript, que funciona normalmente. O aviso aparece uma vez
 * por animação criada e polui o console de quem está depurando.
 *
 * Esta constante só serve para calar esse aviso pedindo, em cada plataforma, o
 * driver que ela realmente tem. O comportamento visual é o mesmo nas duas.
 *
 * ⚠️ NÃO CONFUNDA COM ANIMAÇÃO PARADA
 * -----------------------------------
 * Se as animações da web parecerem congeladas, o driver quase nunca é a causa.
 * O suspeito nº 1 é a ABA ESTAR OCULTA: navegadores param o
 * `requestAnimationFrame` de páginas em segundo plano, e o `Animated` anda em
 * cima dele. Numa aba escondida, toda animação para — com qualquer driver.
 *
 * Como checar em 5 segundos, no console da página:
 *
 *     document.visibilityState        // "hidden" já explica tudo
 *     let n = 0; requestAnimationFrame(function f(){ n++; requestAnimationFrame(f); });
 *     setTimeout(() => console.log(n), 1000);   // 0 = rAF parado
 *
 * (Este projeto já pagou o preço dessa confusão: a hipótese "o driver nativo
 * não anima na web" parecia certa, explicava o sintoma e estava errada.)
 *
 * COMO USAR
 * ---------
 * Em vez de `useNativeDriver: true`, escreva `useNativeDriver: DRIVER_NATIVO`.
 *
 * Continua valendo a regra do que É animável pelo driver nativo: só `opacity`
 * e `transform`. Animar cor, largura ou altura exige `false` nas duas
 * plataformas — e nesse caso escreva `false` direto, não esta constante.
 */
export const DRIVER_NATIVO = Platform.OS !== 'web';
