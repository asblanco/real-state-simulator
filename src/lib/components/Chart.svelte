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
  let mounted = false;

  async function createChart() {
    const Chart = (await import("chart.js/auto")).default;
    if (chart) chart.destroy();
    chart = new Chart(canvas, {
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
    mounted = true;
  }

  onMount(createChart);
  onDestroy(() => chart?.destroy());

  $effect(() => {
    if (mounted && chart) {
      chart.data.labels = labels;
      chart.data.datasets = datasets;
      chart.update();
    }
  });
</script>

<canvas bind:this={canvas} class="w-full h-full"></canvas>
