export const HAUSGELD_NO_TRANSF = 150;
export const UMLAGEFAEHIG = 350;
export const HAUSGELD_TOTAL = HAUSGELD_NO_TRANSF + UMLAGEFAEHIG; // 500
export const RESERVA_PRIVADA = 40;
export const TAX_RATE = 0.42;
export const ITP_RATE = 0.035;
export const NOTARIO_RATE = 0.02;
export const AGENCIA_RATE = 0.0357;
export const AFA_BUILDING_PCT = 0.75;
export const AFA_FLAT_1 = 400;
export const AFA_FLAT_2 = 1000;
export const YEARS = 10;
export const MONTHS_PER_YEAR = 12;

import type { InputParams } from "./types";

export const DEFAULT_PARAMS: InputParams = {
  precio: 340_000,
  parking: 15_000,
  entradaPct: 0.15,
  interesPct: 0.0422,
  tilgungPct: 0.015,
  alquilerInicialPiso: 1125,
  alquilerInicialParking: 80,
  subidaPct: 0.15,
  inflacionPct: 0.03,
  afaPct: 0.035,
};
