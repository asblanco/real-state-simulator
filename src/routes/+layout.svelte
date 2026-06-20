<script lang="ts">
  import "../app.css";
  import { page } from "$app/stores";
  import { base } from "$app/paths";
  import { params } from "$lib/stores/params";
  import { locale, t } from "$lib/i18n";
  import NavBar from "$lib/components/NavBar.svelte";
  import { etfCagr } from "$lib/stores/computed";

  const months = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  let now = new Date();
  let month = months[now.getMonth()];
  let year = now.getFullYear();

  function updateParam(key: string, val: number) {
    $params = { ...$params, [key]: val };
  }
</script>

<div class="max-w-7xl mx-auto pt-8">
  <header class="mb-8 border-b border-gray-200 pb-6 flex items-start justify-between">
    <div>
      <h1 class="text-3xl font-extrabold text-[#0A2540] tracking-tight">{$t("app.title")}</h1>
      <p class="text-sm text-gray-500 italic mt-0.5">{$t("app.subtitle")} — {month} {year}</p>
    </div>
    <select
      id="lang-select"
      class="text-xs border border-gray-300 rounded-lg px-2 py-1.5 bg-white text-gray-700 cursor-pointer self-start mt-1"
      value={$locale}
      onchange={(e) => locale.set(e.target.value as "es" | "en" | "de")}
    >
      <option value="es">🇪🇸 ES</option>
      <option value="en">🇬🇧 EN</option>
      <option value="de">🇩🇪 DE</option>
    </select>
  </header>

  <NavBar />

  <div class="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start mb-8">
    {#if $page.url.pathname.startsWith(`${base}/etf`)}
    <aside class="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs lg:col-span-1 lg:sticky lg:top-6 z-40">
      <h2 class="text-base font-bold text-[#0A2540] border-b border-gray-100 pb-2 mb-3">{$t("etf.etf_return")}</h2>
      <input type="range" min="1" max="15" step="0.25" value={$etfCagr * 100}
        oninput={(e) => $etfCagr = parseFloat(e.target.value) / 100}
        class="w-full h-2 accent-[#635BFF]" />
      <div class="flex justify-between text-xs text-gray-400 mt-1">
        <span>1%</span>
        <span>15%</span>
      </div>
      <p class="text-center text-3xl font-black text-[#635BFF] mt-3">{($etfCagr * 100).toFixed(1)}%</p>
      <div class="flex gap-1.5 mt-3">
        <button onclick={() => $etfCagr = 0.05}
          class="flex-1 text-xs font-bold py-1.5 rounded-lg transition-colors {$etfCagr === 0.05 ? 'bg-[#635BFF] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} cursor-pointer">5%</button>
        <button onclick={() => $etfCagr = 0.07}
          class="flex-1 text-xs font-bold py-1.5 rounded-lg transition-colors {$etfCagr === 0.07 ? 'bg-[#635BFF] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} cursor-pointer">7%</button>
        <button onclick={() => $etfCagr = 0.10}
          class="flex-1 text-xs font-bold py-1.5 rounded-lg transition-colors {$etfCagr === 0.10 ? 'bg-[#635BFF] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} cursor-pointer">10%</button>
      </div>
      <p class="text-[10px] text-gray-400 text-center mt-2">{$t("etf.presets_label")}</p>

      <div class="pt-3 mt-3 border-t border-gray-200">
        <label class="block text-xs font-semibold text-gray-500 mb-1">{$t("slider.anos_proyeccion")} <span class="text-[#635BFF] font-bold">{$params.years}</span> {$t("slider.anos")}</label>
        <input type="range" min="10" max="30" step="1" value={$params.years}
          oninput={(e) => updateParam("years", parseInt(e.target.value))}
          class="w-full accent-[#635BFF]">
      </div>

      <div class="pt-3 mt-3 border-t border-gray-200">
        <label class="block text-xs font-semibold text-gray-500 mb-1">{$t("etf.extra_contribution")} <span class="text-[#635BFF] font-bold">{$params.extraMonthlyContribution}</span> €</label>
        <input type="range" min="0" max="2000" step="50" value={$params.extraMonthlyContribution}
          oninput={(e) => updateParam("extraMonthlyContribution", parseFloat(e.target.value))}
          class="w-full accent-[#635BFF]">
      </div>

      <div class="pt-3 mt-3 border-t border-gray-200">
        <label class="block text-xs font-semibold text-gray-500 mb-1">{$t("etf.swr_label")} <span class="text-[#635BFF] font-bold">{($params.swrPct * 100).toFixed(1)}</span>%</label>
        <input type="range" min="1" max="10" step="0.25" value={$params.swrPct * 100}
          oninput={(e) => updateParam("swrPct", parseFloat(e.target.value) / 100)}
          class="w-full accent-[#635BFF]">
        <div class="flex justify-between text-[10px] text-gray-400 mt-0.5">
          <span>1%</span>
          <span>10%</span>
        </div>
      </div>

      <div class="pt-3 mt-3 border-t border-gray-200">
        <label class="block text-xs font-semibold text-gray-500 mb-1">{$t("etf.target_withdrawal_label")} <span class="text-[#635BFF] font-bold">{$params.targetWithdrawal}</span> €</label>
        <input type="range" min="0" max="5000" step="100" value={$params.targetWithdrawal}
          oninput={(e) => updateParam("targetWithdrawal", parseFloat(e.target.value))}
          class="w-full accent-[#635BFF]">
      </div>

      <div class="pt-3 mt-3 border-t border-gray-200">
        <label class="block text-xs font-semibold text-gray-500 mb-2">{$t("etf.tax_country")}</label>
        <div class="flex gap-2">
          <button onclick={() => updateParam("taxCountry", "de")}
            class="flex-1 text-xs font-bold py-2 rounded-lg transition-colors {$params.taxCountry === 'de' ? 'bg-[#635BFF] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} cursor-pointer">🇩🇪 DE</button>
          <button onclick={() => updateParam("taxCountry", "es")}
            class="flex-1 text-xs font-bold py-2 rounded-lg transition-colors {$params.taxCountry === 'es' ? 'bg-[#635BFF] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} cursor-pointer">🇪🇸 ES</button>
        </div>
      </div>
    </aside>
    {:else}
    <aside class="bg-white p-3 rounded-2xl border border-gray-200 shadow-xs lg:col-span-1 space-y-2 lg:sticky lg:top-6 z-40 max-h-[calc(100vh-3rem)] overflow-y-auto">
      <h2 class="text-base font-bold text-[#0A2540] border-b border-gray-100 pb-2 mb-1">{$t("panel.variables")}</h2>

      <div class="collapse collapse-arrow">
        <input type="checkbox" class="peer" checked />
        <div class="collapse-title text-base font-bold text-[#0A2540]">{$t("section.inmueble")}</div>
        <div class="collapse-content">
          <div class="space-y-5 pt-2">

            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1">{$t("slider.precio_piso")} <span class="text-[#635BFF] font-bold">{$params.precio.toLocaleString("de-DE")}</span> €</label>
              <input type="range" id="input-precio" min="200000" max="600000" step="5000" value={$params.precio}
                oninput={(e) => updateParam("precio", parseFloat(e.target.value))}
                class="w-full accent-[#635BFF]">
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1">{$t("slider.precio_parking")} <span class="text-[#635BFF] font-bold">{$params.parking.toLocaleString("de-DE")}</span> €</label>
              <input type="range" id="input-parking" min="0" max="40000" step="5000" value={$params.parking}
                oninput={(e) => updateParam("parking", parseFloat(e.target.value))}
                class="w-full accent-[#635BFF]">
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1">{$t("slider.entrada")} <span class="text-[#635BFF] font-bold">{($params.entradaPct * 100).toFixed(0)}</span>%</label>
              <input type="range" id="input-entrada" min="0" max="50" step="1" value={$params.entradaPct * 100}
                oninput={(e) => updateParam("entradaPct", parseFloat(e.target.value) / 100)}
                class="w-full accent-[#635BFF]">
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1">{$t("slider.interes")} <span class="text-[#635BFF] font-bold">{($params.interesPct * 100).toFixed(2)}</span>%</label>
              <input type="range" id="input-interes" min="1.0" max="6.0" step="0.05" value={$params.interesPct * 100}
                oninput={(e) => updateParam("interesPct", parseFloat(e.target.value) / 100)}
                class="w-full accent-[#635BFF]">
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1">{$t("slider.tilgung")} <span class="text-[#635BFF] font-bold">{($params.tilgungPct * 100).toFixed(1)}</span>%</label>
              <input type="range" id="input-tilgung" min="1.0" max="3.0" step="0.25" value={$params.tilgungPct * 100}
                oninput={(e) => updateParam("tilgungPct", parseFloat(e.target.value) / 100)}
                class="w-full accent-[#635BFF]">
            </div>

            <div class="pt-2 border-t border-gray-100">
              <label class="block text-xs font-bold text-emerald-700 mb-1">{$t("slider.revalorizacion")} <span class="text-emerald-600">{($params.inflacionPct * 100).toFixed(1)}</span>%</label>
              <input type="range" id="input-inflacion" min="0.0" max="5.0" step="0.1" value={$params.inflacionPct * 100}
                oninput={(e) => updateParam("inflacionPct", parseFloat(e.target.value) / 100)}
                class="w-full accent-emerald-600">
            </div>

            <div class="pt-2 border-t border-gray-100">
              <label class="block text-xs font-semibold text-gray-500 mb-1">{$t("slider.anos_proyeccion")} <span class="text-[#635BFF] font-bold">{$params.years}</span> {$t("slider.anos")}</label>
              <input type="range" id="input-anos" min="10" max="30" step="1" value={$params.years}
                oninput={(e) => updateParam("years", parseInt(e.target.value))}
                class="w-full accent-[#635BFF]">
            </div>

          </div>
        </div>
      </div>

      <div class="collapse collapse-arrow">
        <input type="checkbox" class="peer" />
        <div class="collapse-title text-base font-bold text-[#0A2540]">{$t("section.alquiler")}</div>
        <div class="collapse-content">
          <div class="space-y-5 pt-2">

            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1">{$t("slider.alquiler_piso")} <span class="text-[#635BFF] font-bold">{$params.alquilerInicialPiso.toLocaleString("de-DE")}</span> €</label>
              <input type="range" id="input-alquiler" min="800" max="2000" step="25" value={$params.alquilerInicialPiso}
                oninput={(e) => updateParam("alquilerInicialPiso", parseFloat(e.target.value))}
                class="w-full accent-[#635BFF]">
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1">{$t("slider.alquiler_parking")} <span class="text-[#635BFF] font-bold">{$params.alquilerInicialParking}</span> €</label>
              <input type="range" id="input-alquiler-parking" min="0" max="300" step="10" value={$params.alquilerInicialParking}
                oninput={(e) => updateParam("alquilerInicialParking", parseFloat(e.target.value))}
                class="w-full accent-[#635BFF]">
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1">{$t("slider.subida_anual")} <span class="text-[#635BFF] font-bold">{$params.subidaPct * 100}</span>%</label>
              <input type="range" id="input-subida" min="0" max="5" step="0.25" value={$params.subidaPct * 100}
                oninput={(e) => updateParam("subidaPct", parseFloat(e.target.value) / 100)}
                class="w-full accent-[#635BFF]">
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1">{$t("slider.depreciacion")} <span class="text-[#635BFF] font-bold">{$params.afaYears}</span> {$t("slider.anos")}</label>
              <input type="range" id="input-afa" min="10" max="50" step="1" value={$params.afaYears}
                oninput={(e) => updateParam("afaYears", parseInt(e.target.value))}
                class="w-full accent-[#635BFF]">
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1">{$t("slider.hausgeld_total")} <span class="text-[#635BFF] font-bold">{$params.hausgeldMensualInicial}</span> €</label>
              <input type="range" id="input-hausgeld" min="0" max="1000" step="25" value={$params.hausgeldMensualInicial}
                oninput={(e) => updateParam("hausgeldMensualInicial", parseFloat(e.target.value))}
                class="w-full accent-[#635BFF]">
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1">{$t("slider.reserva_imprevistos")} <span class="text-[#635BFF] font-bold">{$params.reservaImprevistos}</span> €</label>
              <input type="range" id="input-reserva-imprevistos" min="0" max="200" step="25" value={$params.reservaImprevistos}
                oninput={(e) => updateParam("reservaImprevistos", parseFloat(e.target.value))}
                class="w-full accent-[#635BFF]">
            </div>

          </div>
        </div>
      </div>
    </aside>
    {/if}

    <main class="space-y-6 lg:col-span-3">
      <slot />
    </main>
  </div>
</div>
