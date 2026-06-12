<script lang="ts">
  let {
    id = "",
    label = "",
    min = 0,
    max = 100,
    step = 1,
    unit = "",
    value = 0,
    onChange = (_val: number) => {},
  }: {
    id: string;
    label: string;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    value: number;
    onChange?: (val: number) => void;
  } = $props();
</script>

<div>
  <label class="block text-xs font-semibold text-gray-500 mb-1" for="input-{id}">
    {label}
    <span class="text-[#635BFF] font-bold">{value}{unit}</span>
  </label>
  <input
    type="range"
    id="input-{id}"
    {min}
    {max}
    {step}
    {value}
    oninput={(e) => onChange(parseFloat((e.target as HTMLInputElement).value))}
    class="w-full accent-[#635BFF]"
  />
</div>
