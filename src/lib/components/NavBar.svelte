<script lang="ts">
  import { page } from "$app/stores";
  import { base } from "$app/paths";
  import { t } from "../i18n";

  const tabs = [
    { path: `${base}/`, key: "nav.dashboard" },
    { path: `${base}/etf`, key: "nav.etf" },
  ];
</script>

<nav class="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
  {#each tabs as tab}
    <a
      href={tab.path}
      class="px-4 py-2.5 text-sm font-bold whitespace-nowrap rounded-t-lg transition-colors
        {$page.url.pathname === tab.path
          ? 'text-[#635BFF] border-b-2 border-[#635BFF] bg-white'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}"
      data-sveltekit-preload-data="off"
    >
      {$t(tab.key)}
    </a>
  {/each}
</nav>
