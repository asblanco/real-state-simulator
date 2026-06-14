export const HAUSGELD_MENSUAL_INICIAL = 500;
export const UMLAGE_PCT = 0.6;

export const TAX_RATE = 0.42;
export const ITP_RATE = 0.035;
export const NOTARIO_RATE = 0.02;
export const AGENCIA_RATE = 0.0357;
export const AFA_BUILDING_PCT = 0.75;
export const AFA_RND_YEARS = 28;
export const AFA_RND_RATE = 1 / AFA_RND_YEARS;
export const YEARS_MIN = 10;
export const YEARS_MAX = 30;
export const YEARS_DEFAULT = 10;
export const MONTHS_PER_YEAR = 12;

export const ETF_CAGR_DEFAULT = 0.07;
export const ETF_CAGR_MIN = 0.01;
export const ETF_CAGR_MAX = 0.15;

export const SWR_DEFAULT = 0.04;
export const SWR_MIN = 0.01;
export const SWR_MAX = 0.10;
export const TARGET_WITHDRAWAL_DEFAULT = 1000;

export const TAX_COUNTRIES = {
  de: { taxRate: 0.26375, taxableRatio: 0.7, allowance: 1000 },
  es: { taxRate: 0.26, taxableRatio: 1.0, allowance: 0 },
} as const;

export type TaxCountry = keyof typeof TAX_COUNTRIES;

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
  hausgeldMensualInicial: HAUSGELD_MENSUAL_INICIAL,
  useFlatRate: false,
  reservaImprevistos: 100,
  extraMonthlyContribution: 0,
  swrPct: SWR_DEFAULT,
  targetWithdrawal: TARGET_WITHDRAWAL_DEFAULT,
  taxCountry: "de",
  years: YEARS_DEFAULT,
};
