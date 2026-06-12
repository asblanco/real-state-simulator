import { writable } from "svelte/store";
import type { InputParams } from "../types";
import { DEFAULT_PARAMS } from "../constants";

const stored = typeof localStorage !== "undefined"
  ? localStorage.getItem("sim-params")
  : null;

const initial: InputParams = stored
  ? { ...DEFAULT_PARAMS, ...JSON.parse(stored) }
  : { ...DEFAULT_PARAMS };

export const params = writable<InputParams>(initial);

if (typeof localStorage !== "undefined") {
  params.subscribe(($p) => {
    localStorage.setItem("sim-params", JSON.stringify($p));
  });
}
