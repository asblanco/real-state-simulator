export const HAUSGELD_TOTAL = 500;
export const UMLAGE_PCT = 0.6;

export const TAX_RATE = 0.42;
export const ITP_RATE = 0.035;
export const NOTARIO_RATE = 0.02;
export const AGENCIA_RATE = 0.0357;
export const AFA_BUILDING_PCT = 0.75;
export const AFA_RND_YEARS = 28;
export const AFA_RND_RATE = 1 / AFA_RND_YEARS; // ~3.5714%
export const YEARS_MIN = 10;
export const YEARS_MAX = 30;
export const YEARS_DEFAULT = 10;
export const MONTHS_PER_YEAR = 12;

import type { InputParams } from "./types";

export const DEFAULT_PARAMS: InputParams = {
  precio: 340_000,
  parking: 15_000,
  entradaPct: 0.15,
  interesPct: 0.0422,
  tilgungPct: 0.015,
  alquilerInicialPiso: 1220,
  alquilerInicialParking: 80,
  subidaPct: 0.02,
  inflacionPct: 0.03,
  afaYears: AFA_RND_YEARS,
  hausgeldTotal: HAUSGELD_TOTAL,
  useFlatRate: false,
  reservaImprevistos: 100,
  years: YEARS_DEFAULT,
};
