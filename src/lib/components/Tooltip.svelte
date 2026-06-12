<script lang="ts">
  let { content = "", children } = $props();
  let trigger: HTMLSpanElement;
  let tooltipEl = $state<HTMLDivElement>();
  let show = $state(false);

  function position() {
    if (!trigger || !tooltipEl) return;
    const rect = trigger.getBoundingClientRect();
    const tt = tooltipEl.getBoundingClientRect();
    let top = rect.top - tt.height - 8;
    let left = rect.left + rect.width / 2 - tt.width / 2;
    if (top < 4) top = rect.bottom + 8;
    if (left < 4) left = 4;
    if (left + tt.width > window.innerWidth - 4) left = window.innerWidth - tt.width - 4;
    tooltipEl.style.top = `${top}px`;
    tooltipEl.style.left = `${left}px`;
  }

  function enter() {
    show = true;
    requestAnimationFrame(position);
  }

  function leave() {
    show = false;
  }
</script>

<span bind:this={trigger} onmouseenter={enter} onmouseleave={leave} role="tooltip" class="inline-flex items-center gap-0.5 cursor-help">
  {@render children()}
</span>

{#if show}
  <div bind:this={tooltipEl} class="fixed z-[9999] pointer-events-none bg-[#0A2540] text-white text-xs rounded-lg p-2.5 w-64 shadow-xl leading-relaxed">
    {@html content}
  </div>
{/if}
