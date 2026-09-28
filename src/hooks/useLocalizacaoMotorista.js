import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';

/**
 * HOOK: useLocalizacaoMotorista
 * -----------------------------
 *
 * ⚠️ FORA DE USO HOJE — E DE PROPÓSITO.
 * O protótipo inteiro se passa em Fortaleza: a grade de demanda, os endereços
 * da corrida, o aeroporto do destino. Com o GPS real ligado, o puck ficava na
 * cidade de quem está testando enquanto a oferta era uma corrida para o Pinto
 * Martins — dois lugares na mesma tela. Hoje `MapaScreen` usa uma posição fixa
 * e o app NUNCA pede permissão de localização.
 *
 * O arquivo fica porque o mecanismo é o do Módulo 1 e continua correto. Para
 * religar, troque a constante em `MapaScreen` pela chamada deste hook — e
 * lembre que aí a simulação de Fortaleza volta a discordar do mapa.
 *
 * Um "hook" é uma função que encapsula lógica com estado para ser reaproveitada
 * em qualquer tela. Aqui isolamos TODA a complexidade de GPS:
 *
 *   1. pedir permissão ao usuário
 *   2. pegar a posição inicial
 *   3. abrir uma "assinatura" (watchPositionAsync) que dispara sempre que o
 *      motorista se move
 *   4. cancelar a assinatura quando a tela é destruída (senão vaza bateria!)
 *
 * A tela só precisa fazer: const { local, erro } = useLocalizacaoMotorista();
 */
export function useLocalizacaoMotorista({ ativo = true } = {}) {
  const [local, setLocal] = useState(null);   // { latitude, longitude, heading, speed }
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const inscricaoRef = useRef(null);          // guarda a assinatura para cancelar depois

  useEffect(() => {
    let cancelado = false;

    async function iniciar() {
      try {
        // 1) Permissão. No Android/iOS o app SÓ recebe GPS depois do "sim" do usuário.
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (!cancelado) {
            setErro('Permissão de localização negada. Ative nas configurações do aparelho.');
            setCarregando(false);
          }
          return;
        }

        // 2) Posição inicial — o watch pode demorar alguns segundos para o 1º ponto.
        const inicial = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        if (!cancelado) {
          setLocal(formatar(inicial));
          setCarregando(false);
        }

        // 3) Atualizações contínuas.
        //    distanceInterval: só avisa depois de andar X metros (economiza bateria)
        //    timeInterval: intervalo mínimo entre atualizações, em ms
        inscricaoRef.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            distanceInterval: 5,
            timeInterval: 2000,
          },
          (posicao) => {
            if (!cancelado) setLocal(formatar(posicao));
          }
        );
      } catch (e) {
        if (!cancelado) {
          setErro('Não foi possível obter a localização: ' + e.message);
          setCarregando(false);
        }
      }
    }

    if (ativo) iniciar();

    // 4) Limpeza: roda quando o componente sai da tela ou quando `ativo` muda.
    return () => {
      cancelado = true;
      if (inscricaoRef.current) {
        inscricaoRef.current.remove();
        inscricaoRef.current = null;
      }
    };
  }, [ativo]);

  return { local, erro, carregando };
}

function formatar(posicao) {
  return {
    latitude: posicao.coords.latitude,
    longitude: posicao.coords.longitude,
    heading: posicao.coords.heading ?? 0,   // direção em graus (0 = norte)
    speed: posicao.coords.speed ?? 0,       // m/s
    precisao: posicao.coords.accuracy,
    momento: posicao.timestamp,
  };
}
