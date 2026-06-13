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
    content = "",
    tdClass = "",
    width = "w-64",
    children,
  }: {
    content: string;
    tdClass?: string;
    width?: string;
    children?: import("svelte").Snippet;
  } = $props();

  let open = $state(false);

  const floating = useFloating({
    get open() { return open },
    onOpenChange: (v) => (open = v),
    placement: "bottom",
    middleware: [offset(6), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(floating.context, { move: false });
  const focus = useFocus(floating.context);
  const dismiss = useDismiss(floating.context);
  const role = useRole(floating.context, { role: "tooltip" });
  const interactions = useInteractions([hover, focus, dismiss, role]);
</script>

<td
  bind:this={floating.elements.reference}
  {...interactions.getReferenceProps()}
  class="{tdClass} relative cursor-help"
  role="button"
  tabindex="0"
>
  {#if children}
    {@render children()}
  {/if}
  {#if open}
    <div
      bind:this={floating.elements.floating}
      style={floating.floatingStyles}
      class="bg-[#0A2540] text-white text-xs rounded-xl p-4 {width} shadow-xl z-50 leading-relaxed"
    >
      {@html content}
    </div>
  {/if}
</td>
