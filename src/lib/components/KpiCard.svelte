<script lang="ts">
  let {
    label = "",
    value = "",
    valueClass = "text-[#0A2540]",
    labelClass = "text-gray-400",
    bgClass = "bg-white",
    tooltipContent = "",
    id = "",
  }: {
    label: string;
    value: string;
    valueClass?: string;
    labelClass?: string;
    bgClass?: string;
    tooltipContent?: string;
    id?: string;
  } = $props();
</script>

<div {id} class="{bgClass} p-5 rounded-2xl border border-gray-200 shadow-xs {tooltipContent ? 'relative group cursor-help' : ''}">
  <p class="text-xs font-bold {labelClass} uppercase tracking-wider">
    {label}
    {#if tooltipContent}
      <svg class="w-3.5 h-3.5 ml-1 inline {labelClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    {/if}
  </p>
  <p class="text-xl font-black mt-1 {valueClass}">{value}</p>
  {#if tooltipContent}
    <div class="absolute left-0 top-full mt-2 hidden group-hover:block bg-[#0A2540] text-white text-xs rounded-xl p-4 w-72 shadow-xl z-50 pointer-events-none">
      {@html tooltipContent}
    </div>
  {/if}
</div>
