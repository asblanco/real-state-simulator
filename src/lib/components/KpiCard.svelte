<script lang="ts">
  import {
    useFloating,
    useInteractions,
    useHover,
    useFocus,
    useRole,
    useDismiss,
    autoUpdate,
    offset,
    flip,
    shift,
  } from "@skeletonlabs/floating-ui-svelte";

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

  let open = $state(false);

  const floating = useFloating({
    get open() { return open },
    onOpenChange: (v) => (open = v),
    placement: "bottom-start",
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(floating.context, { move: false });
  const focus = useFocus(floating.context);
  const dismiss = useDismiss(floating.context);
  const role = useRole(floating.context, { role: "tooltip" });
  const interactions = useInteractions([hover, focus, dismiss, role]);
</script>

<div
  {id}
  bind:this={floating.elements.reference}
  {...(tooltipContent ? interactions.getReferenceProps() : {})}
  class="{bgClass} p-5 rounded-2xl border border-gray-200 shadow-xs {tooltipContent ? 'relative cursor-help' : ''}"
  role="button"
  tabindex="0"
>
  <p class="text-xs font-bold {labelClass} uppercase tracking-wider">
    {label}
    {#if tooltipContent}
      <svg class="w-3.5 h-3.5 ml-1 inline {labelClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    {/if}
  </p>
  <p class="text-xl font-black mt-1 {valueClass}">{value}</p>
  {#if tooltipContent && open}
    <div
      bind:this={floating.elements.floating}
      style={floating.floatingStyles}
      class="bg-[#0A2540] text-white text-xs rounded-xl p-4 w-72 shadow-xl z-50"
    >
      {@html tooltipContent}
    </div>
  {/if}
</div>
