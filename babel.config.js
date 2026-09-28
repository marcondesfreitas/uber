/**
 * Configuração do Babel para Expo.
 * `babel-preset-expo` já traz o suporte a JSX, a sintaxe moderna de JavaScript
 * e as transformações específicas do React Native. Um projeto Expo não roda
 * sem este arquivo.
 */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
