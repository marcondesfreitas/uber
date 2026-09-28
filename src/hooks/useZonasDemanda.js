import { useEffect, useMemo, useRef, useState } from 'react';
import { gerarGrade, simularDemanda } from '../data/zonasDemanda';
import { calcularSurge } from '../services/precoDinamico';

/**
 * HOOK: useZonasDemanda
 * ---------------------
 * Junta as três peças: grade → simulação → surge, e roda isso num relógio.
 *
 * Duas decisões de performance que valem por si só:
 *
 * 1) A GRADE É MEMOIZADA (useMemo). Ela só é recalculada se o centro mudar
 *    "de verdade". Se dependesse do objeto `centro` do GPS, seria recriada a
 *    cada metro andado — e recriar 81 polígonos 30x por minuto derruba o FPS.
 *    Por isso arredondamos o centro para 2 casas decimais (~1,1 km): a grade
 *    só se reposiciona quando o motorista realmente saiu da área.
 *
 * 2) O ESTADO DA EMA VIVE NUM useRef, não num useState. Ele é memória interna
 *    do algoritmo, não algo que a tela desenha. Guardar em state causaria um
 *    render extra a cada rodada, sem nenhum benefício.
 */
export function useZonasDemanda({ centro, ativo = true, intervaloMs = 4000 }) {
  const [zonas, setZonas] = useState([]);
  const [tick, setTick] = useState(0);
  const estadosRef = useRef(new Map()); // memória da suavização (EMA)

  // Trava o centro numa "âncora" grosseira para não regerar a grade à toa.
  const ancora = useMemo(() => {
    if (!centro) return null;
    return {
      latitude: Math.round(centro.latitude * 100) / 100,
      longitude: Math.round(centro.longitude * 100) / 100,
    };
  }, [
    centro ? Math.round(centro.latitude * 100) : null,
    centro ? Math.round(centro.longitude * 100) : null,
  ]);

  const grade = useMemo(() => {
    if (!ancora) return [];
    return gerarGrade(ancora, { raioCelulas: 4, tamanhoMetros: 700 });
  }, [ancora]);

  // O relógio: incrementa o tick, que faz a demanda evoluir.
  useEffect(() => {
    if (!ativo) return;
    const id = setInterval(() => setTick((t) => t + 1), intervaloMs);
    return () => clearInterval(id); // sempre limpe o intervalo!
  }, [ativo, intervaloMs]);

  // Recalcula sempre que o tick avança ou a grade muda.
  useEffect(() => {
    if (!ativo || grade.length === 0) {
      setZonas([]);
      return;
    }
    const simuladas = simularDemanda(grade, tick);
    const { celulas, estados } = calcularSurge(simuladas, estadosRef.current);
    estadosRef.current = estados;
    setZonas(celulas);
  }, [grade, tick, ativo]);

  /** A zona "quente" mais próxima — útil para sugerir para onde ir. */
  const melhorZona = useMemo(() => {
    if (zonas.length === 0) return null;
    return zonas.reduce((melhor, z) => (z.multiplicador > melhor.multiplicador ? z : melhor), zonas[0]);
  }, [zonas]);

  return { zonas, melhorZona, tick };
}
