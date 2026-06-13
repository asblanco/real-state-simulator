<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  let {
    type = "line" as "line" | "bar",
    labels = [] as string[],
    datasets = [] as {
      label: string;
      data: number[];
      backgroundColor?: string | ((ctx: any) => string);
      borderColor?: string;
      borderWidth?: number;
      tension?: number;
      fill?: boolean;
      pointRadius?: number;
      pointBackgroundColor?: string;
      borderDash?: number[];
      borderRadius?: number;
    }[],
    options = {} as Record<string, any>,
    title = "",
  } = $props();

  let canvas: HTMLCanvasElement;
  let chart: any = null;
  let chartLib: any = $state(null);

  onMount(async () => {
    chartLib = (await import("chart.js/auto")).default;
  });

  $effect(() => {
    if (!chartLib || !canvas) return;
    if (chart) {
      chart.data.labels = labels;
      chart.data.datasets = datasets;
      chart.update();
    } else {
      chart = new chartLib(canvas, {
        type,
        data: { labels, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: title
              ? {
                  display: true,
                  text: title,
                  font: { size: 14, weight: "bold" },
                  color: "#0A2540",
                }
              : undefined,
          },
          ...options,
        },
      });
    }
  });

  onDestroy(() => chart?.destroy());
</script>

<canvas bind:this={canvas} class="w-full h-full"></canvas>
